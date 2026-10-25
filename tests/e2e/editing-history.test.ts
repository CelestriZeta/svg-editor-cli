import { describe, expect, it } from 'vitest';

import type { CommandResult } from '../../src/application/commands/contracts/CommandResult.js';
import { UndoableCommand } from '../../src/application/commands/contracts/UndoableCommand.js';
import { HelpResult } from '../../src/application/commands/results/HelpResult.js';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

describe('shape editing and undo history', () => {
  it('[DELETE-02, CHANGE-02/03/04/05, HIST-01/02] edits, undoes and redoes through the CLI', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { history, repl } = harness;

    expect(await repl.executeLine('init 400 300')).toBe('canvas 400x300 created');
    expect(await repl.executeLine('create rect r1 10 20 30 40')).toBe(
      'rect#r1 created'
    );
    expect(await repl.executeLine('create circle c1 100 100 20')).toBe(
      'circle#c1 created'
    );
    expect(await repl.executeLine('create text title 20 40 "My Diagram"')).toBe(
      'text#title created'
    );

    expect(await repl.executeLine('move c1 30 0')).toBe(
      'circle#c1 moved to (130,100)'
    );
    expect(await repl.executeLine('undo')).toBe(
      'circle#c1 moved back to (100,100)'
    );
    expect(await repl.executeLine('redo')).toBe(
      'circle#c1 moved to (130,100)'
    );

    expect(await repl.executeLine('scale c1 2')).toBe(
      'circle#c1 scaled by 2 to (260,200)'
    );
    expect(await repl.executeLine('undo')).toBe(
      'circle#c1 scale undone to (130,100)'
    );
    expect(await repl.executeLine('redo')).toBe(
      'circle#c1 scaled by 2 to (260,200)'
    );

    expect(
      await repl.executeLine('set title text "My Diagram v2"')
    ).toBe('text#title updated: text="My Diagram v2"');
    expect(await repl.executeLine('undo')).toBe(
      'text#title updated: text="My Diagram"'
    );
    expect(await repl.executeLine('redo')).toBe(
      'text#title updated: text="My Diagram v2"'
    );

    expect(await repl.executeLine('set r1 fill red')).toBe(
      'rect#r1 updated: fill=red'
    );
    expect(await repl.executeLine('undo')).toBe(
      'rect#r1 updated: fill unset'
    );
    expect(await repl.executeLine('redo')).toBe(
      'rect#r1 updated: fill=red'
    );

    expect(await repl.executeLine('set r1 stroke-width 2')).toBe(
      'rect#r1 updated: stroke-width=2'
    );
    expect(await repl.executeLine('undo')).toBe(
      'rect#r1 updated: stroke-width unset'
    );
    expect(await repl.executeLine('redo')).toBe(
      'rect#r1 updated: stroke-width=2'
    );

    expect(await repl.executeLine('delete title')).toBe('text#title deleted');
    expect(await repl.executeLine('undo')).toBe('text#title restored');
    expect(await repl.executeLine('redo')).toBe('text#title deleted');
    expect(await repl.executeLine('undo')).toBe('text#title restored');

    const beforeNewEdit = history.undoCount();
    expect(await repl.executeLine('move r1 5 5')).toBe(
      'rect#r1 moved to (15,25)'
    );
    expect(history.undoCount()).toBe(beforeNewEdit + 1);
    expect(await repl.executeLine('redo')).toBe('error: nothing to redo');
    expect(await repl.executeLine('tree')).toContain(
      'rect#r1        x=15 y=25 w=30 h=40 fill=red'
    );
  });

  it('[CHANGE-02, GEO-02/04] edits and restores complete composite subtrees', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { repl } = harness;

    await repl.executeLine('init 200 200');
    await repl.executeLine('create g group');
    await repl.executeLine('create rect r1 10 20 30 40 in group');
    await repl.executeLine('create text label 20 45 "hello" in group');

    expect(await repl.executeLine('delete r1')).toBe('rect#r1 deleted');
    expect(await repl.executeLine('undo')).toBe(
      'rect#r1 restored into g#group'
    );
    expect(await repl.executeLine('redo')).toBe('rect#r1 deleted');
    expect(await repl.executeLine('undo')).toBe(
      'rect#r1 restored into g#group'
    );

    expect(await repl.executeLine('move group 5 -5')).toBe(
      'g#group moved by (5,-5)'
    );
    expect(await repl.executeLine('tree')).toContain(
      'rect#r1        x=15 y=15 w=30 h=40'
    );
    expect(await repl.executeLine('undo')).toBe(
      'g#group moved back by (-5,5)'
    );
    expect(await repl.executeLine('tree')).toContain(
      'rect#r1        x=10 y=20 w=30 h=40'
    );

    expect(await repl.executeLine('redo')).toBe('g#group moved by (5,-5)');
    expect(await repl.executeLine('tree')).toContain(
      'rect#r1        x=15 y=15 w=30 h=40'
    );
    expect(await repl.executeLine('undo')).toBe('g#group moved back by (-5,5)');

    expect(await repl.executeLine('scale group 2')).toBe(
      'g#group scaled by 2'
    );
    expect(await repl.executeLine('tree')).toContain(
      'text#label     (40,90) "hello"'
    );
    expect(await repl.executeLine('undo')).toBe('g#group scale undone');
    expect(await repl.executeLine('tree')).toContain(
      'text#label     (20,45) "hello"'
    );

    expect(await repl.executeLine('delete group')).toBe('g#group deleted');
    expect(await repl.executeLine('tree')).toBe('svg (200x200)');
    expect(await repl.executeLine('undo')).toBe('g#group restored');
    expect(await repl.executeLine('tree')).toContain(
      'g#group\n    ├── rect#r1        x=10 y=20 w=30 h=40\n    └── text#label     (20,45) "hello"'
    );
  });

  it('[HIST-04/05/09, CHANGE-13] preserves history on barriers, empty stacks and failed undo', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { history, repl } = harness;

    expect(await repl.executeLine('undo')).toBe(
      "error: no document. use 'init' or 'read' first"
    );
    expect(await repl.executeLine('init 100 100')).toBe(
      'canvas 100x100 created'
    );
    expect(await repl.executeLine('undo')).toBe(
      'error: undo not allowed after io command'
    );
    expect(await repl.executeLine('redo')).toBe(
      'error: undo not allowed after io command'
    );

    await repl.executeLine('create rect r1 0 0 10 10');
    expect(await repl.executeLine('save "barrier.svg"')).toBe(
      'saved to barrier.svg (1 element)'
    );
    expect(await repl.executeLine('undo')).toBe(
      'error: undo not allowed after io command'
    );
    expect(await repl.executeLine('create rect r2 0 0 10 10')).toBe(
      'rect#r2 created'
    );
    expect(history.isBlocked()).toBe(false);
    expect(await repl.executeLine('undo')).toBe('rect#r2 creation undone');

    const failing = new FailingUndoCommand();
    await harness.executor.execute(failing);
    const undoCount = history.undoCount();
    const redoCount = history.redoCount();
    const blocked = history.isBlocked();
    const shapeBefore = (await repl.executeLine('tree')) as string;

    expect(await repl.executeLine('undo')).toBe(
      'error: command failed'
    );
    expect(history.undoCount()).toBe(undoCount);
    expect(history.redoCount()).toBe(redoCount);
    expect(history.isBlocked()).toBe(blocked);
    expect(await repl.executeLine('tree')).toBe(shapeBefore);
  });

  it('[TARGET-01, SET-05/06/07, GEO-06] keeps every failed edit out of the history', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { history, repl } = harness;

    await repl.executeLine('init 100 100');
    await repl.executeLine('create rect r1 0 0 10 10');
    await repl.executeLine('create text title 0 0 "hello"');
    const treeBefore = await repl.executeLine('tree');
    const undoCount = history.undoCount();
    const redoCount = history.redoCount();
    const blocked = history.isBlocked();

    const failures: readonly [string, string][] = [
      ['delete missing', 'error: no such shape: missing'],
      ['move missing 1 1', 'error: no such shape: missing'],
      ['move r1 nope 1', 'error: move dx must be a number'],
      ['move r1 1', 'error: move requires a shape id, dx and dy'],
      ['scale r1 0', 'error: scale factor must be positive'],
      ['scale r1 nope', 'error: scale factor must be a number'],
      ['set r1 width 0', 'error: width must be positive'],
      ['set title text ""', 'error: text must not be empty'],
      ['set r1 font-size 12', 'error: unknown attribute: font-size'],
      ['set r1 fill', 'error: set requires a shape id, attribute and value']
    ];

    for (const [command, error] of failures) {
      expect(await repl.executeLine(command)).toBe(error);
      expect(await repl.executeLine('tree')).toBe(treeBefore);
    }

    expect(history.undoCount()).toBe(undoCount);
    expect(history.redoCount()).toBe(redoCount);
    expect(history.isBlocked()).toBe(blocked);
  });

  it('[CHANGE-06/07/08/09, HIST-03] undo and redo every structural edit command', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { history, repl } = harness;

    await repl.executeLine('init 200 200');
    await repl.executeLine('create g root');
    await repl.executeLine('create rect r1 0 0 10 10 in root');
    await repl.executeLine('create circle c1 20 20 5 in root');

    expect(await repl.executeLine('group cluster r1 c1')).toBe(
      'g#cluster created with 2 children'
    );
    expect(await repl.executeLine('undo')).toBe('g#cluster grouping undone');
    expect(await repl.executeLine('redo')).toBe(
      'g#cluster created with 2 children'
    );

    expect(await repl.executeLine('ungroup cluster')).toBe(
      'g#cluster ungrouped with 2 children'
    );
    expect(await repl.executeLine('undo')).toBe(
      'g#cluster regrouped with 2 children'
    );
    expect(await repl.executeLine('redo')).toBe(
      'g#cluster ungrouped with 2 children'
    );

    expect(await repl.executeLine('addto root r1')).toBe(
      'rect#r1 moved into g#root'
    );
    expect(await repl.executeLine('undo')).toBe(
      'rect#r1 moved back from g#root'
    );
    expect(await repl.executeLine('redo')).toBe(
      'rect#r1 moved into g#root'
    );

    await repl.executeLine('create rect r2 4 4 8 8 in root');
    const historyBeforeReorder = history.undoCount();
    expect(await repl.executeLine('front r1')).toBe('rect#r1 moved to front');
    expect(history.undoCount()).toBe(historyBeforeReorder + 1);
    expect(await repl.executeLine('undo')).toBe(
      'rect#r1 front order undone'
    );
    expect(await repl.executeLine('redo')).toBe('rect#r1 moved to front');
  });

  it('[HIST-01/02] does not create empty history units for unchanged edits', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { history, repl } = harness;

    await repl.executeLine('init 100 100');
    await repl.executeLine('create rect r1 10 20 30 40');
    const initialCount = history.undoCount();

    expect(await repl.executeLine('move r1 0 0')).toBe(
      'rect#r1 moved to (10,20)'
    );
    expect(await repl.executeLine('scale r1 1')).toBe(
      'rect#r1 scaled by 1 to (10,20)'
    );
    expect(await repl.executeLine('set r1 width 30')).toBe(
      'rect#r1 updated: width=30'
    );
    expect(history.undoCount()).toBe(initialCount);

    await repl.executeLine('create rect r2 1 1 2 2');
    expect(await repl.executeLine('undo')).toBe('rect#r2 creation undone');
    expect(history.redoCount()).toBe(1);
    expect(await repl.executeLine('move r1 0 0')).toBe(
      'rect#r1 moved to (10,20)'
    );
    expect(history.redoCount()).toBe(1);
    expect(await repl.executeLine('redo')).toBe(
      'rect#r2 created'
    );
  });
});

class FailingUndoCommand extends UndoableCommand {
  #hasExecuted = false;

  public constructor() {
    super();
  }

  public async execute(): Promise<CommandResult> {
    this.#hasExecuted = true;
    return new HelpResult([]);
  }

  public async undo(): Promise<CommandResult> {
    if (!this.#hasExecuted) {
      throw new Error('command was not executed');
    }
    throw new Error('private undo failure');
  }

  public async redo(): Promise<CommandResult> {
    return new HelpResult([]);
  }
}
