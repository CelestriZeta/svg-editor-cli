import { describe, expect, it } from 'vitest';

import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Rect } from '../../src/domain/shapes/Rect.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';
import { ShapeStyle } from '../../src/domain/shapes/ShapeStyle.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { TextSpec } from '../../src/domain/specs/TextSpec.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';

describe('SVG writing', () => {
  it('[SAVE-04/05] escapes XML content and serializes optional styles', () => {
    const document = new SvgDocument(100, 50);
    const rect = document.createShape(
      new RectSpec(
        'r&"1',
        1,
        2,
        3,
        4,
        new ShapeStyle('red&"')
      )
    ) as Rect;
    rect.set(ShapeAttributeUpdate.text('stroke', '<blue>'));
    rect.set(ShapeAttributeUpdate.number('stroke-width', 2.5));
    document.createShape(new TextSpec('t1', 5, 6, 'A & B < C > "D"'));

    const svg = new SvgWriteVisitor().serialize(document);

    expect(svg).toContain(
      '<rect id="r&amp;&quot;1" x="1" y="2" width="3" height="4" fill="red&amp;&quot;" stroke="&lt;blue&gt;" stroke-width="2.5"/>'
    );
    expect(svg).toContain(
      '<text id="t1" x="5" y="6">A &amp; B &lt; C &gt; &quot;D&quot;</text>'
    );
  });
});
