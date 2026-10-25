import { describe, expect, it } from 'vitest';

import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

describe('tree and show queries', () => {
  it('[CLI-10] formats the full document or a shape subtree', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { repl } = harness;

    await repl.executeLine('init 300 200');
    await repl.executeLine('create g scene');
    await repl.executeLine(
      'create rect background 0 0 300 200 #ffffff in scene'
    );
    await repl.executeLine('create g card in scene');
    await repl.executeLine('set card fill #eeeeee');
    await repl.executeLine('create circle dot 30 40 5 red in card');

    expect(await repl.executeLine('tree')).toBe(
      [
        'svg (300x200)',
        '└── g#scene',
        '    ├── rect#background x=0 y=0 w=300 h=200 fill=#ffffff',
        '    └── g#card         fill=#eeeeee',
        '        └── circle#dot     cx=30 cy=40 r=5 fill=red'
      ].join('\n')
    );
    expect(await repl.executeLine('tree card')).toBe(
      [
        'g#card         fill=#eeeeee',
        '└── circle#dot     cx=30 cy=40 r=5 fill=red'
      ].join('\n')
    );
    expect(await repl.executeLine('tree dot')).toBe(
      'circle#dot     cx=30 cy=40 r=5 fill=red'
    );
  });

  it('[CLI-11] shows every shape geometry and style with its parent', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { repl } = harness;

    await repl.executeLine('init 300 200');
    await repl.executeLine('create g root');
    await repl.executeLine('create rect r 1 2 3 4 #fff in root');
    await repl.executeLine('set r stroke black');
    await repl.executeLine('set r stroke-width 2');
    await repl.executeLine('create circle c 10 20 3 red in root');
    await repl.executeLine('create ellipse e 4 5 6 7 green in root');
    await repl.executeLine('create line l 1 2 3 4 black in root');
    await repl.executeLine('create text t 5 6 "hello world" in root');

    expect(await repl.executeLine('show r')).toBe(
      [
        'rect#r  parent=g#root',
        '  x=1 y=2 w=3 h=4',
        '  fill=#fff stroke=black stroke-width=2'
      ].join('\n')
    );
    expect(await repl.executeLine('show c')).toBe(
      [
        'circle#c  parent=g#root',
        '  cx=10 cy=20 r=3',
        '  fill=red'
      ].join('\n')
    );
    expect(await repl.executeLine('show e')).toBe(
      [
        'ellipse#e  parent=g#root',
        '  cx=4 cy=5 rx=6 ry=7',
        '  fill=green'
      ].join('\n')
    );
    expect(await repl.executeLine('show l')).toBe(
      [
        'line#l  parent=g#root',
        '  (1,2) -> (3,4)',
        '  stroke=black'
      ].join('\n')
    );
    expect(await repl.executeLine('show t')).toBe(
      [
        'text#t  parent=g#root',
        '  (5,6) "hello world"'
      ].join('\n')
    );
    expect(await repl.executeLine('show root')).toBe(
      'g#root  parent=svg'
    );
  });

  it('[CLI-12, HIST-03] rejects invalid queries without changing history', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const { history, repl } = harness;

    await repl.executeLine('init 100 100');
    await repl.executeLine('create rect r 0 0 10 10');
    const undoCount = history.undoCount();
    const blocked = history.isBlocked();

    expect(await repl.executeLine('tree missing')).toBe(
      'error: no such shape: missing'
    );
    expect(await repl.executeLine('show missing')).toBe(
      'error: no such shape: missing'
    );
    expect(await repl.executeLine('tree r extra')).toBe(
      'error: tree takes at most one argument'
    );
    expect(await repl.executeLine('show')).toBe(
      'error: show requires one shape id'
    );
    expect(await repl.executeLine('show r extra')).toBe(
      'error: show requires one shape id'
    );
    expect(history.undoCount()).toBe(undoCount);
    expect(history.isBlocked()).toBe(blocked);
  });
});
