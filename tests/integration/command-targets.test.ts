import { describe, expect, it } from 'vitest';

import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

describe('shape and container target failures', () => {
  it('[TARGET-01, TREE-03/04/06/08/09/13] preserves state for every invalid target', async () => {
    const store = new RecordingDocumentStore();
    const harness = new ApplicationHarness(store);
    const { history, repl } = harness;
    await repl.executeLine('init 100 100');
    await repl.executeLine('create g outer');
    await repl.executeLine('create g inner in outer');
    await repl.executeLine('create rect r1 0 0 10 10 in inner');
    await repl.executeLine('create rect r2 10 10 5 5');
    const before = await repl.executeLine('tree');
    const undoCount = history.undoCount();
    const blocked = history.isBlocked();
    const cases: readonly [string, string][] = [
      ['group "" r1 r2', 'error: shape id must not be empty'],
      ['group cluster r1', 'error: group requires at least two shapes'],
      ['group cluster r1 r1', 'error: duplicate group target: r1'],
      ['group cluster r1 missing', 'error: no such shape: missing'],
      [
        'group cluster outer inner',
        'error: cannot group a container into its own descendant: outer'
      ],
      ['ungroup r1', 'error: not a container: r1'],
      ['ungroup missing', 'error: no such container: missing'],
      ['addto missing r2', 'error: no such container: missing'],
      ['addto inner missing', 'error: no such shape: missing'],
      [
        'addto inner outer',
        'error: cannot move a container into its own descendant: outer'
      ],
      ['front missing', 'error: no such shape: missing'],
      ['back missing', 'error: no such shape: missing']
    ];

    for (const [command, error] of cases) {
      expect(await repl.executeLine(command)).toBe(error);
      expect(await repl.executeLine('tree')).toBe(before);
    }

    expect(history.undoCount()).toBe(undoCount);
    expect(history.isBlocked()).toBe(blocked);
    expect(store.savedPath).toBeUndefined();
  });
});
