import { readFile } from 'node:fs/promises';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SvgDocumentStore } from '../../src/infrastructure/SvgDocumentStore.js';
import { SvgReader } from '../../src/infrastructure/SvgReader.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { TemporaryDirectory } from '../support/TemporaryDirectory.js';

describe('six shapes -> tree -> save', () => {
  let directory: TemporaryDirectory;

  beforeEach(async () => {
    directory = await TemporaryDirectory.create('svg-editor-shapes-');
  });

  afterEach(async () => {
    await directory.dispose();
  });

  it('[CREATE-02/03/04/05/06, SAVE-05] dispatches and serializes all built-in shapes', async () => {
    const file = directory.file('shapes.svg');
    const harness = new ApplicationHarness(
      new SvgDocumentStore(new SvgReader(), new SvgWriteVisitor())
    );
    const { repl } = harness;

    expect(await repl.executeLine('init 400 300')).toBe(
      'canvas 400x300 created'
    );
    expect(await repl.executeLine('create rect r1 10 20 30 40 red')).toBe(
      'rect#r1 created'
    );
    expect(await repl.executeLine('create circle c1 50 60 10')).toBe(
      'circle#c1 created'
    );
    expect(await repl.executeLine('create ellipse e1 70 80 12 8 blue')).toBe(
      'ellipse#e1 created'
    );
    expect(await repl.executeLine('create line l1 1 2 3 4 black')).toBe(
      'line#l1 created'
    );
    expect(await repl.executeLine('create text t1 5 6 "hello world"')).toBe(
      'text#t1 created'
    );
    expect(await repl.executeLine('create g g1')).toBe('g#g1 created');

    expect(await repl.executeLine('tree')).toBe(
      [
        'svg (400x300)',
        '├── rect#r1        x=10 y=20 w=30 h=40 fill=red',
        '├── circle#c1      cx=50 cy=60 r=10',
        '├── ellipse#e1     cx=70 cy=80 rx=12 ry=8 fill=blue',
        '├── line#l1        (1,2) -> (3,4) stroke=black',
        '├── text#t1        (5,6) "hello world"',
        '└── g#g1'
      ].join('\n')
    );
    expect(await repl.executeLine(`save "${file}"`)).toBe(
      `saved to ${file} (6 elements)`
    );

    const svg = await readFile(file, 'utf8');
    expect(svg).toContain(
      '<circle id="c1" cx="50" cy="60" r="10"/>'
    );
    expect(svg).toContain(
      '<ellipse id="e1" cx="70" cy="80" rx="12" ry="8" fill="blue"/>'
    );
    expect(svg).toContain(
      '<line id="l1" x1="1" y1="2" x2="3" y2="4" stroke="black"/>'
    );
    expect(svg).toContain('<text id="t1" x="5" y="6">hello world</text>');
    expect(svg).toContain('<g id="g1"/>');
  });
});
