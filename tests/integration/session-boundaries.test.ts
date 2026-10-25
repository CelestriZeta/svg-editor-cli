import { describe, expect, it } from 'vitest';

import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

describe('session boundaries', () => {
  it('[HIST-10] allows help without a document and rejects document commands', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { repl } = harness;

    expect(await repl.executeLine('help')).toContain('  init [w] [h]');
    const expected = "error: no document. use 'init' or 'read' first";
    expect(await repl.executeLine('tree')).toBe(expected);
    expect(await repl.executeLine('tree r1')).toBe(expected);
    expect(await repl.executeLine('show r1')).toBe(expected);
    expect(await repl.executeLine('create rect r1 0 0 1 1')).toBe(expected);
    expect(await repl.executeLine('group cluster r1 r2')).toBe(expected);
    expect(await repl.executeLine('save demo.svg')).toBe(expected);
    expect(harness.history.undoCount()).toBe(0);
  });

  it('[DOC-03/04] rejects invalid init values and clears the default path', async () => {
    const store = new RecordingDocumentStore();
    const harness = new ApplicationHarness(store);
    const { history, repl } = harness;

    expect(await repl.executeLine('init 10 20')).toBe('canvas 10x20 created');
    expect(await repl.executeLine('create rect r1 0 0 1 1')).toBe(
      'rect#r1 created'
    );
    expect(await repl.executeLine('save "first.svg"')).toBe(
      'saved to first.svg (1 element)'
    );
    expect(await repl.executeLine('save')).toBe('saved to first.svg (1 element)');

    const before = await repl.executeLine('tree');
    const undoCount = history.undoCount();
    for (const command of ['init -1 20', 'init 10 nope', 'init 10']) {
      expect(await repl.executeLine(command)).toMatch(/^error: /);
    }
    expect(await repl.executeLine('tree')).toBe(before);
    expect(history.undoCount()).toBe(undoCount);
    expect(history.isBlocked()).toBe(true);

    expect(await repl.executeLine('init 30 40')).toBe('canvas 30x40 created');
    expect(await repl.executeLine('save')).toBe(
      "error: no file path; use 'save <file.svg>'"
    );
    expect(store.savedPath).toBe('first.svg');
    expect(history.isBlocked()).toBe(true);
  });

  it('[HIST-03] keeps history unchanged for tree and help queries', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { history, repl } = harness;
    await repl.executeLine('init 10 20');
    await repl.executeLine('create rect r1 0 0 1 1');
    const beforeCount = history.undoCount();
    const beforeBlocked = history.isBlocked();

    await repl.executeLine('tree');
    await repl.executeLine('help');

    expect(history.undoCount()).toBe(beforeCount);
    expect(history.isBlocked()).toBe(beforeBlocked);
  });
});
