import { readdir, readFile } from 'node:fs/promises';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SvgDocumentStore } from '../../src/infrastructure/SvgDocumentStore.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { TemporaryDirectory } from '../support/TemporaryDirectory.js';

describe('init -> create rect -> tree -> save', () => {
  let directory: TemporaryDirectory;

  beforeEach(async () => {
    directory = await TemporaryDirectory.create('svg-editor-e2e-');
  });

  afterEach(async () => {
    await directory.dispose();
  });

  it('[SAVE-02/04/06, HIST-07] runs the complete path through a real file', async () => {
    const file = directory.file('demo.svg');
    const harness = new ApplicationHarness(
      new SvgDocumentStore(new SvgWriteVisitor())
    );
    const { history, repl } = harness;

    expect(await repl.executeLine('tree')).toBe(
      "error: no document. use 'init' or 'read' first"
    );
    expect(await repl.executeLine('init')).toBe('canvas 800x600 created');
    expect(history.isBlocked()).toBe(true);
    expect(await repl.executeLine('create rect r1 10 20 100 50 #eee')).toBe(
      'rect#r1 created'
    );
    expect(history.canUndo()).toBe(true);
    expect(history.isBlocked()).toBe(false);
    expect(await repl.executeLine('tree')).toBe(
      [
        'svg (800x600)',
        '└── rect#r1        x=10 y=20 w=100 h=50 fill=#eee'
      ].join('\n')
    );
    expect(await repl.executeLine(`save "${file}"`)).toBe(
      `saved to ${file} (1 element)`
    );
    expect(history.canUndo()).toBe(false);
    expect(history.isBlocked()).toBe(true);
    expect(await repl.executeLine('save')).toBe(
      `saved to ${file} (1 element)`
    );
    expect(await readdir(directory.path)).toEqual(['demo.svg']);
    expect(await readFile(file, 'utf8')).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">',
        '  <rect id="r1" x="10" y="20" width="100" height="50" fill="#eee"/>',
        '</svg>',
        ''
      ].join('\n')
    );
  });

  it('[EXEC-02] keeps history and path unchanged after a real write failure', async () => {
    const invalidFile = directory.file('missing/demo.svg');
    const harness = new ApplicationHarness(
      new SvgDocumentStore(new SvgWriteVisitor())
    );
    const { history, repl } = harness;

    await repl.executeLine('init 100 100');
    await repl.executeLine('create rect r1 0 0 10 10');

    expect(await repl.executeLine(`save "${invalidFile}"`)).toBe(
      `error: cannot write file: ${invalidFile}`
    );
    expect(history.canUndo()).toBe(true);
    expect(history.isBlocked()).toBe(false);
    expect(await repl.executeLine('tree')).toBe(
      [
        'svg (100x100)',
        '└── rect#r1        x=0 y=0 w=10 h=10'
      ].join('\n')
    );
  });
});
