import { describe, expect, it } from 'vitest';

import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

describe('structure editing commands', () => {
  it('[CREATE-11/12/13, TREE-05/07/10] edits nested structure through the CLI', async () => {
    const store = new RecordingDocumentStore();
    const harness = new ApplicationHarness(store);
    const { repl } = harness;

    expect(await repl.executeLine('init 400 300')).toBe('canvas 400x300 created');
    expect(await repl.executeLine('create g outer')).toBe('g#outer created');
    expect(await repl.executeLine('create g left in outer')).toBe(
      'g#left created in g#outer'
    );
    expect(
      await repl.executeLine('create rect r1 10 20 30 40 red in left')
    ).toBe('rect#r1 created in g#left');
    expect(
      await repl.executeLine('create text label 15 45 "hello" in left')
    ).toBe('text#label created in g#left');
    expect(await repl.executeLine('create g right in outer')).toBe(
      'g#right created in g#outer'
    );
    expect(
      await repl.executeLine('create circle c1 300 100 20 blue in right')
    ).toBe('circle#c1 created in g#right');

    expect(await repl.executeLine('group cluster r1 c1')).toBe(
      'g#cluster created with 2 children'
    );
    expect(await repl.executeLine('ungroup left')).toBe(
      'g#left ungrouped with 1 child'
    );
    expect(await repl.executeLine('addto cluster label')).toBe(
      'text#label moved into g#cluster'
    );
    expect(await repl.executeLine('back label')).toBe(
      'text#label moved to back'
    );
    expect(await repl.executeLine('front label')).toBe(
      'text#label moved to front'
    );

    expect(await repl.executeLine('tree')).toBe(
      [
        'svg (400x300)',
        '└── g#outer',
        '    ├── g#right',
        '    └── g#cluster',
        '        ├── rect#r1        x=10 y=20 w=30 h=40 fill=red',
        '        ├── circle#c1      cx=300 cy=100 r=20 fill=blue',
        '        └── text#label     (15,45) "hello"'
      ].join('\n')
    );
    expect(harness.history.undoCount()).toBe(11);
    expect(await repl.executeLine('save "structure.svg"')).toBe(
      'saved to structure.svg (6 elements)'
    );
    expect(store.savedPath).toBe('structure.svg');
  });

  it('[TREE-03/04/06/09/11] rejects invalid structure operations', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { repl } = harness;

    expect(await repl.executeLine('init 100 100')).toBe('canvas 100x100 created');
    expect(await repl.executeLine('create g root')).toBe('g#root created');
    expect(
      await repl.executeLine('create rect r1 0 0 10 10 in root')
    ).toBe('rect#r1 created in g#root');
    const before = await repl.executeLine('tree');
    const undoCount = harness.history.undoCount();

    expect(await repl.executeLine('front root')).toBe(
      'g#root already at front'
    );
    expect(await repl.executeLine('back root')).toBe('g#root already at back');
    expect(await repl.executeLine('create rect "" 0 0 10 10')).toBe(
      'error: shape id must not be empty'
    );
    expect(await repl.executeLine('create text empty 0 0 ""')).toBe(
      'error: text must not be empty'
    );
    expect(await repl.executeLine('create rect r2 0 0 10 10 in missing')).toBe(
      'error: no such container: missing'
    );
    expect(await repl.executeLine('create rect r3 0 0 10 10 in r1')).toBe(
      'error: not a container: r1'
    );
    expect(await repl.executeLine('group root r1')).toBe(
      'error: id already exists: root'
    );
    expect(await repl.executeLine('group nested r1 root')).toBe(
      'error: cannot group a container into its own descendant: root'
    );
    expect(await repl.executeLine('ungroup root')).toBe(
      'error: cannot ungroup top-level container: root'
    );
    expect(await repl.executeLine('addto r1 root')).toBe(
      'error: not a container: r1'
    );

    expect(await repl.executeLine('tree')).toBe(before);
    expect(harness.history.undoCount()).toBe(undoCount);
    expect(harness.history.isBlocked()).toBe(false);
  });

  it('[CREATE-10/14, CMD-03, E2E-05] rejects box, unknown types and bad arity', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { repl } = harness;

    await repl.executeLine('init 100 100');
    await repl.executeLine('create rect r1 0 0 10 10');
    const before = await repl.executeLine('tree');
    const undoCount = harness.history.undoCount();

    expect(await repl.executeLine('create box b1 0 0 10 10 "box"')).toBe(
      'error: unknown shape type: box (is the plugin loaded?)'
    );
    expect(await repl.executeLine('create hexagon h1 0 0 10')).toBe(
      'error: unknown shape type: hexagon (is the plugin loaded?)'
    );
    expect(await repl.executeLine('create rect too-many 0 0 10 10 red extra')).toBe(
      'error: rect requires x, y, width and height'
    );
    expect(await repl.executeLine('create rect')).toBe(
      'error: create requires a type and id'
    );
    expect(await repl.executeLine('create g g2 in')).toBe(
      "error: create g requires a container after 'in'"
    );
    expect(await repl.executeLine('group')).toBe(
      'error: group requires a new group id and target ids'
    );
    expect(await repl.executeLine('ungroup r1 extra')).toBe(
      'error: ungroup requires one container id'
    );
    expect(await repl.executeLine('addto r1')).toBe(
      'error: addto requires a container id and a shape id'
    );
    expect(await repl.executeLine('front r1 extra')).toBe(
      'error: front requires one shape id'
    );

    expect(await repl.executeLine('tree')).toBe(before);
    expect(harness.history.undoCount()).toBe(undoCount);
    expect(harness.history.isBlocked()).toBe(false);
  });
});
