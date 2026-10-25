import { execFileSync, spawnSync } from 'node:child_process';
import { copyFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { SvgReader } from '../../src/infrastructure/SvgReader.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';
import { TemporaryDirectory } from '../support/TemporaryDirectory.js';

const root = fileURLToPath(new URL('../..', import.meta.url));
const entry = fileURLToPath(new URL('../../dist/bootstrap/entry.js', import.meta.url));
const fixtures = new URL('../fixtures/acceptance/', import.meta.url);

describe('course acceptance through the production CLI', () => {
  let directory: TemporaryDirectory;

  beforeAll(() => {
    execFileSync(process.execPath, ['scripts/clean.mjs'], { cwd: root });
    execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.build.json'], { cwd: root });
  });

  beforeEach(async () => {
    directory = await TemporaryDirectory.create('svg-editor-acceptance-');
  });

  afterEach(async () => {
    await directory.dispose();
  });

  function replay(input: string): string {
    const result = spawnSync(process.execPath, [entry], {
      cwd: directory.path, input, encoding: 'utf8', timeout: 10_000
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
    return result.stdout.replaceAll('\r\n', '\n');
  }

  it('[E2E-01/03] replays section 6 and round-trips the imported document', async () => {
    await copyFile(new URL('other.svg', fixtures), directory.file('other.svg'));
    const script = await readFile(new URL('typical.txt', fixtures), 'utf8');
    const output = replay(script);
    expect(output).toBe(await readFile(new URL('typical.expected.txt', fixtures), 'utf8'));
    const demo = await readFile(directory.file('demo.svg'), 'utf8');
    expect(demo).toBe(await readFile(new URL('demo.svg', fixtures), 'utf8'));

    const imported = replay('read other.svg\ntree\nsave imported.svg\nread imported.svg\ntree\n');
    expect(imported.match(/warning:/g)).toHaveLength(1);
    expect(imported).toContain('read imported.svg (7 elements)');
    const trees = imported.split('svg (400x300)\n').slice(1).map(text =>
      text.split('\n').slice(0, 7).join('\n'));
    expect(trees).toHaveLength(2);
    expect(trees[0]).toBe(trees[1]);
    const reader = new SvgReader();
    const writer = new SvgWriteVisitor();
    const original = reader.read(await readFile(directory.file('other.svg'), 'utf8'));
    const restored = reader.read(await readFile(directory.file('imported.svg'), 'utf8'));
    expect(writer.serialize(restored.document)).toBe(writer.serialize(original.document));
    expect(restored.assignedIds).toHaveLength(0);
  });

  it('[E2E-02] replays section 6.1 A including composite move and undo', async () => {
    const script = await readFile(new URL('flowchart.txt', fixtures), 'utf8');
    const output = replay(script);
    expect(output).toBe(await readFile(new URL('flowchart.expected.txt', fixtures), 'utf8'));
    expect(await readFile(directory.file('flowchart.svg'), 'utf8')).toBe(
      await readFile(new URL('flowchart.svg', fixtures), 'utf8')
    );
  });

  it('[E2E-04] preserves tree, path, redo and barriers after real CLI failures', () => {
    const tree = 'svg (100x100)\n└── rect#r1        x=1 y=2 w=3 h=4';
    const output = replay([
      'init 100 100', 'create rect r1 1 2 3 4', 'save stable.svg',
      'move r1 10 20', 'undo', 'tree',
      'create rect r1 0 0 1 1', 'read missing.svg', 'save missing/out.svg',
      'set r1 width -1', 'group bad r1 missing', 'tree', 'redo', 'show r1',
      'undo', 'save', 'undo', 'create box unsupported 0 0 1 1 title',
      'undo', 'tree', ''
    ].join('\n'));
    expect(output.match(/error: /g)).toHaveLength(8);
    expect(output.split(tree)).toHaveLength(4);
    expect(output).toContain('rect#r1 moved to (11,22)');
    expect(output).toContain('  x=11 y=22 w=3 h=4');
    expect(output.match(/saved to stable.svg \(1 element\)/g)).toHaveLength(2);
    expect(output.match(/error: undo not allowed after io command/g)).toHaveLength(2);
    expect(output).not.toMatch(/warning:|Error:|\bat .*\.js:/);
  });
});
