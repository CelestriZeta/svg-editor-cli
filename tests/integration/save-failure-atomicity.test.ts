import { readFile, readdir, rename, writeFile } from 'node:fs/promises';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SvgDocumentStore } from '../../src/infrastructure/SvgDocumentStore.js';
import { SvgReader } from '../../src/infrastructure/SvgReader.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { TemporaryDirectory } from '../support/TemporaryDirectory.js';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return { ...actual, writeFile: vi.fn(actual.writeFile), rename: vi.fn(actual.rename) };
});

describe('save failure atomicity with real files', () => {
  let directory: TemporaryDirectory;

  beforeEach(async () => {
    directory = await TemporaryDirectory.create('svg-editor-write-failure-');
  });

  afterEach(async () => {
    await directory.dispose();
  });

  it.each(['create', 'partial write', 'replace'] as const)(
    '[SAVE-07/08] preserves the same target and complete session after %s failure',
    async (failure) => {
      const harness = new ApplicationHarness(new SvgDocumentStore(new SvgReader(), new SvgWriteVisitor()));
      const { repl, history } = harness;
      const path = directory.file('existing.svg');
      await repl.executeLine('init 100 100');
      await repl.executeLine('create rect r1 1 2 3 4');
      await repl.executeLine(`save "${path}"`);
      const original = await readFile(path, 'utf8');
      await repl.executeLine('move r1 1 2');
      await repl.executeLine('move r1 3 4');
      await repl.executeLine('undo');
      const tree = await repl.executeLine('tree');
      const state = [history.undoCount(), history.redoCount(), history.isBlocked()];

      const error = new Error(`injected ${failure} failure`);
      if (failure === 'replace') {
        vi.mocked(rename).mockRejectedValueOnce(error);
      } else {
        vi.mocked(writeFile).mockImplementationOnce(async (...args) => {
          if (failure === 'partial write') {
            // The next call uses the real implementation and leaves a partial temporary file.
            await writeFile(args[0], 'partial', 'utf8');
          }
          throw error;
        });
      }

      expect(await repl.executeLine(`save "${path}"`)).toBe(`error: cannot write file: ${path}`);
      expect(await readFile(path, 'utf8')).toBe(original);
      expect(await readdir(directory.path)).toEqual(['existing.svg']);
      expect(await repl.executeLine('tree')).toBe(tree);
      expect([history.undoCount(), history.redoCount(), history.isBlocked()]).toEqual(state);
      expect(await repl.executeLine('redo')).toBe('rect#r1 moved to (5,8)');
      expect(await repl.executeLine('save')).toBe(`saved to ${path} (1 element)`);
      expect(await readFile(path, 'utf8')).toContain('x="5" y="8"');
    }
  );
});
