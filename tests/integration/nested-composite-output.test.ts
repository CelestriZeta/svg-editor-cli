import { describe, expect, it } from 'vitest';

import { DocumentViewVisitor } from '../../src/application/queries/DocumentViewVisitor.js';
import { TreeFormatter } from '../../src/cli/TreeFormatter.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Group } from '../../src/domain/shapes/Group.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';

describe('nested composite output', () => {
  it('[GEO-08, SAVE-04] shares recursive traversal for tree and SVG output', () => {
    const document = new SvgDocument(200, 100);
    const outer = document.createShape(new GroupSpec('outer')) as Group;
    const inner = document.createShape(new GroupSpec('inner'), outer) as Group;
    document.createShape(new RectSpec('r1', 1, 2, 3, 4, 'red'), inner);

    const tree = new TreeFormatter().format(
      new DocumentViewVisitor().visit(document)
    );
    const svg = new SvgWriteVisitor().serialize(document);

    expect(tree).toBe(
      [
        'svg (200x100)',
        '└── g#outer',
        '    └── g#inner',
        '        └── rect#r1        x=1 y=2 w=3 h=4 fill=red'
      ].join('\n')
    );
    expect(svg).toContain(
      [
        '  <g id="outer">',
        '    <g id="inner">',
        '      <rect id="r1" x="1" y="2" width="3" height="4" fill="red"/>',
        '    </g>',
        '  </g>'
      ].join('\n')
    );
  });
});
