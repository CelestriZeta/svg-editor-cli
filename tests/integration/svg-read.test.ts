import { readFile, writeFile } from 'node:fs/promises';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SvgDocumentStore } from '../../src/infrastructure/SvgDocumentStore.js';
import { SvgReader } from '../../src/infrastructure/SvgReader.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { TemporaryDirectory } from '../support/TemporaryDirectory.js';

describe('SVG reading', () => {
  let directory: TemporaryDirectory;

  beforeEach(async () => {
    directory = await TemporaryDirectory.create('svg-editor-read-');
  });

  afterEach(async () => {
    await directory.dispose();
  });

  it('[READ-01/02/04/10/11, SAVE-01] reads nested SVG, assigns ids and keeps the import path', async () => {
    const path = directory.file('nested.svg');
    await writeFile(
      path,
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">',
        '  <!-- imported -->',
        '  <rect id="rect1" x="0" y="0" width="400" height="300" fill="#ffffff"/>',
        '  <g id="g1">',
        '    <rect x="1" y="2" width="3" height="4" stroke="blue" stroke-width="2"/>',
        '    <text id="t1" x="5" y="6">A &amp; B</text>',
        '    <circle cx="7" cy="8" r="9" fill="red"/>',
        '  </g>',
        '  <ellipse id="e1" cx="1" cy="2" rx="3" ry="4" fill="a&amp;&quot;b"/>',
        '  <line id="l1" x1="1" y1="2" x2="3" y2="4"/>',
        '</svg>',
        ''
      ].join('\n'),
      'utf8'
    );
    const harness = new ApplicationHarness(
      new SvgDocumentStore(new SvgReader(), new SvgWriteVisitor())
    );

    expect(await harness.repl.executeLine(`read "${path}"`)).toBe(
      [
        'warning: assigned id rect2 to unnamed <rect>',
        'warning: assigned id circle1 to unnamed <circle>',
        `read ${path} (7 elements)`
      ].join('\n')
    );
    expect(await harness.repl.executeLine('tree')).toContain(
      [
        'svg (400x300)',
        '├── rect#rect1     x=0 y=0 w=400 h=300 fill=#ffffff',
        '├── g#g1',
        '│   ├── rect#rect2     x=1 y=2 w=3 h=4 stroke=blue stroke-width=2',
        '│   ├── text#t1        (5,6) "A & B"',
        '│   └── circle#circle1 cx=7 cy=8 r=9 fill=red',
        '├── ellipse#e1     cx=1 cy=2 rx=3 ry=4 fill=a&"b',
        '└── line#l1        (1,2) -> (3,4)'
      ].join('\n')
    );
    expect(harness.history.undoCount()).toBe(0);
    expect(harness.history.isBlocked()).toBe(true);

    expect(await harness.repl.executeLine('save')).toBe(
      `saved to ${path} (7 elements)`
    );
    const saved = await readFile(path, 'utf8');
    expect(saved).toContain(
      '<rect id="rect2" x="1" y="2" width="3" height="4" stroke="blue" stroke-width="2"/>'
    );
    expect(saved).toContain('<text id="t1" x="5" y="6">A &amp; B</text>');
    expect(saved).toContain(
      '<ellipse id="e1" cx="1" cy="2" rx="3" ry="4" fill="a&amp;&quot;b"/>'
    );

    expect(await harness.repl.executeLine(`read "${path}"`)).toBe(
      `read ${path} (7 elements)`
    );
  });

  it('[READ-05/06/08/12] rejects invalid SVG without replacing the session', async () => {
    const harness = new ApplicationHarness(
      new SvgDocumentStore(new SvgReader(), new SvgWriteVisitor())
    );
    const { history, repl } = harness;
    const validPath = directory.file('valid.svg');
    const invalidPath = directory.file('invalid.svg');
    await writeFile(
      validPath,
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><rect id="r1" x="0" y="0" width="1" height="1"/></svg>',
      'utf8'
    );
    await writeFile(
      invalidPath,
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><g id="dup"/><rect id="dup" x="0" y="0" width="1" height="1"/></svg>',
      'utf8'
    );

    expect(await repl.executeLine(`read "${validPath}"`)).toBe(
      `read ${validPath} (1 element)`
    );
    const treeBefore = await repl.executeLine('tree');
    const undoCount = history.undoCount();
    const redoCount = history.redoCount();
    const blocked = history.isBlocked();
    const missingPath = directory.file('missing.svg');

    expect(await repl.executeLine(`read "${invalidPath}"`)).toBe(
      'error: id already exists: dup'
    );
    expect(await repl.executeLine(`read "${missingPath}"`)).toBe(
      `error: cannot read file: ${missingPath}`
    );
    expect(await repl.executeLine('tree')).toBe(treeBefore);
    expect(history.undoCount()).toBe(undoCount);
    expect(history.redoCount()).toBe(redoCount);
    expect(history.isBlocked()).toBe(blocked);
    expect(await repl.executeLine('save')).toBe(
      `saved to ${validPath} (1 element)`
    );
  });

  it('[CANVAS-01/02/03, HIST-03/04] queries and resizes the canvas atomically', async () => {
    const harness = new ApplicationHarness(
      new SvgDocumentStore(new SvgReader(), new SvgWriteVisitor())
    );
    const { history, repl } = harness;

    expect(await repl.executeLine('canvas')).toBe(
      "error: no document. use 'init' or 'read' first"
    );
    expect(await repl.executeLine('init 100 50')).toBe(
      'canvas 100x50 created'
    );
    await repl.executeLine('create rect r1 0 0 1 1');
    const undoBefore = history.undoCount();

    expect(await repl.executeLine('canvas')).toBe('canvas 100x50');
    expect(history.undoCount()).toBe(undoBefore);
    expect(await repl.executeLine('canvas 200 80')).toBe(
      'canvas resized to 200x80'
    );
    expect(await repl.executeLine('tree')).toContain('svg (200x80)');
    expect(history.isBlocked()).toBe(true);
    expect(await repl.executeLine('undo')).toBe(
      'error: undo not allowed after io command'
    );

    const treeBefore = await repl.executeLine('tree');
    expect(await repl.executeLine('canvas 0 20')).toBe(
      'error: canvas width and height must be positive finite numbers'
    );
    expect(await repl.executeLine('canvas 10')).toBe(
      'error: canvas requires zero or two arguments'
    );
    expect(await repl.executeLine('tree')).toBe(treeBefore);
  });
});
