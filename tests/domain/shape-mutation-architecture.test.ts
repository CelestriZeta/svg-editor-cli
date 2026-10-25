import { describe, expect, it } from 'vitest';

import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Group } from '../../src/domain/shapes/Group.js';
import { Rect } from '../../src/domain/shapes/Rect.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';

describe('shape mutation architecture', () => {
  it('[ARCH-05/07] keeps container mutation outside the public object API', () => {
    const document = new SvgDocument(100, 100);
    const group = document.createShape(new GroupSpec('g1')) as Group;
    const rect = document.createShape(
      new RectSpec('r1', 1, 2, 3, 4),
      group
    ) as Rect;

    expect('appendChild' in group).toBe(false);
    expect('removeChild' in group).toBe(false);

    document.deleteShape('r1');

    expect(document.elementCount).toBe(1);
    expect(document.findShape('r1')).toBeUndefined();
    expect(rect.parent).toBeUndefined();
  });

  it('[SET-05/07] accepts typed attribute updates instead of command text', () => {
    const document = new SvgDocument(100, 100);
    const rect = document.createShape(
      new RectSpec('r1', 1, 2, 3, 4)
    ) as Rect;

    rect.set(ShapeAttributeUpdate.number('x', 10));
    rect.set(ShapeAttributeUpdate.number('width', 20));
    rect.set(ShapeAttributeUpdate.text('fill', 'red'));
    rect.set(ShapeAttributeUpdate.number('stroke-width', 2));

    expect(rect).toMatchObject({
      x: 10,
      width: 20,
      fill: 'red',
      strokeWidth: 2
    });
    expect(() =>
      rect.set(ShapeAttributeUpdate.text('x', '0x10'))
    ).toThrow('x requires a numeric value');
    expect(() =>
      ShapeAttributeUpdate.number('width', Number.NaN)
    ).toThrow('width must be a finite number');
  });

  it('[GEO-02/04/07, CHANGE-03/04] prepares exact changes before applying them', () => {
    const document = new SvgDocument(100, 100);
    const group = document.createShape(new GroupSpec('g1')) as Group;
    const rect = document.createShape(
      new RectSpec('r1', 1, 2, 3, 4),
      group
    ) as Rect;

    const movePlan = group.prepareMove(10, 20);

    expect(rect).toMatchObject({ x: 1, y: 2 });
    movePlan.apply();
    expect(rect).toMatchObject({ x: 11, y: 22 });
    movePlan.revert();
    expect(rect).toMatchObject({ x: 1, y: 2 });

    const scalePlan = group.prepareScale(2);

    expect(rect).toMatchObject({ x: 1, y: 2, width: 3, height: 4 });
    scalePlan.apply();
    expect(rect).toMatchObject({ x: 2, y: 4, width: 6, height: 8 });
    scalePlan.revert();
    expect(rect).toMatchObject({ x: 1, y: 2, width: 3, height: 4 });
  });
});
