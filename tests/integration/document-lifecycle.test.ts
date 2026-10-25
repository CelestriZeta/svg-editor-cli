import { describe, expect, it } from 'vitest';

import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

describe('document lifecycle', () => {
  it('[DOC-03/04, HIST-06] replaces the document and clears history', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { history, repl } = harness;

    expect(await repl.executeLine('init 100 50')).toBe('canvas 100x50 created');
    expect(await repl.executeLine('create rect r1 0 0 10 10')).toBe(
      'rect#r1 created'
    );
    expect(await repl.executeLine('init 0 50')).toBe(
      'error: canvas width and height must be positive finite numbers'
    );
    expect(await repl.executeLine('init Infinity 50')).toBe(
      'error: canvas width and height must be positive finite numbers'
    );
    expect(await repl.executeLine('init 0x10 50')).toBe(
      'error: canvas width and height must be positive finite numbers'
    );
    expect(await repl.executeLine('tree')).not.toBe('svg (20x10)');
    expect(await repl.executeLine('init 20 10')).toBe('canvas 20x10 created');
    expect(await repl.executeLine('tree')).toBe('svg (20x10)');
    expect(history.canUndo()).toBe(false);
    expect(history.isBlocked()).toBe(true);
  });
});
