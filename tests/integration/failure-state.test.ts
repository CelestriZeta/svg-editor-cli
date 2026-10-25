import { describe, expect, it } from 'vitest';

import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

describe('command failure state', () => {
  it('[CREATE-07/09/14, HIST-08] keeps all state unchanged after failures', async () => {
    const store = new RecordingDocumentStore();
    const harness = new ApplicationHarness(store);
    const { repl } = harness;

    expect(await repl.executeLine('init 200 100')).toBe('canvas 200x100 created');
    expect(await repl.executeLine('create rect r1 1 2 30 40')).toBe(
      'rect#r1 created'
    );
    const before = await repl.executeLine('tree');

    expect(await repl.executeLine('create rect r1 8 9 10 11')).toBe(
      'error: id already exists: r1'
    );
    expect(await repl.executeLine('create rect r2 0')).toBe(
      'error: rect requires x, y, width and height'
    );
    expect(await repl.executeLine('create rect empty "" 0 10 10')).toBe(
      'error: rect x must be a number'
    );
    expect(await repl.executeLine('create rect hex 0x10 0 10 10')).toBe(
      'error: rect x must be a number'
    );
    expect(await repl.executeLine('create hexagon h1 1 2 3')).toBe(
      'error: unknown shape type: hexagon (is the plugin loaded?)'
    );
    expect(await repl.executeLine('save')).toBe(
      "error: no file path; use 'save <file.svg>'"
    );

    expect(await repl.executeLine('tree')).toBe(before);
    expect(harness.history.undoCount()).toBe(1);
    expect(harness.history.isBlocked()).toBe(false);
    expect(store.savedPath).toBeUndefined();
  });
});
