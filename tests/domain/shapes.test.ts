import { describe, expect, it } from 'vitest';

import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Circle } from '../../src/domain/shapes/Circle.js';
import { Ellipse } from '../../src/domain/shapes/Ellipse.js';
import { Group } from '../../src/domain/shapes/Group.js';
import { Line } from '../../src/domain/shapes/Line.js';
import { Rect } from '../../src/domain/shapes/Rect.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';
import { Text } from '../../src/domain/shapes/Text.js';
import { CircleSpec } from '../../src/domain/specs/CircleSpec.js';
import { EllipseSpec } from '../../src/domain/specs/EllipseSpec.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { LineSpec } from '../../src/domain/specs/LineSpec.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { TextSpec } from '../../src/domain/specs/TextSpec.js';

describe('shape model', () => {
  it('[CREATE-01/02/03/04/05/06/08] creates all six SVG shape kinds', () => {
    const document = new SvgDocument(400, 300);
    const rect = document.createShape(
      new RectSpec('rect', 1, 2, 30, 40, 'red')
    );
    const circle = document.createShape(
      new CircleSpec('circle', 50, 60, 10)
    );
    const ellipse = document.createShape(
      new EllipseSpec('ellipse', 70, 80, 12, 8, 'blue')
    );
    const line = document.createShape(
      new LineSpec('line', 1, 2, 3, 4, 'black')
    );
    const text = document.createShape(
      new TextSpec('text', 5, 6, 'Hello SVG')
    ) as Text;
    const group = document.createShape(new GroupSpec('group'));
    document.createShape(new RectSpec('Rect', 0, 0, 1, 1));

    expect(rect).toBeInstanceOf(Rect);
    expect(circle).toBeInstanceOf(Circle);
    expect(ellipse).toBeInstanceOf(Ellipse);
    expect(line).toBeInstanceOf(Line);
    expect(text).toBeInstanceOf(Text);
    expect(group).toBeInstanceOf(Group);
    expect(circle.fill).toBeUndefined();
    expect(circle).toMatchObject({ cx: 50, cy: 60, r: 10 });
    expect(ellipse).toMatchObject({
      cx: 70,
      cy: 80,
      rx: 12,
      ry: 8,
      fill: 'blue'
    });
    expect(line).toMatchObject({ x1: 1, y1: 2, x2: 3, y2: 4 });
    expect(line.stroke).toBe('black');
    expect(text.content).toBe('Hello SVG');
    expect([...document.children].map((shape) => shape.id)).toEqual([
      'rect',
      'circle',
      'ellipse',
      'line',
      'text',
      'group',
      'Rect'
    ]);
  });

  it('[SET-01/02/03/04/05] sets only the selected shape attributes', () => {
    const document = new SvgDocument(400, 300);
    const group = document.createShape(new GroupSpec('g1')) as Group;
    const rect = document.createShape(
      new RectSpec('r1', 10, 20, 30, 40),
      group
    ) as Rect;
    const text = document.createShape(
      new TextSpec('t1', 5, 6, 'before'),
      group
    ) as Text;
    const circle = document.createShape(
      new CircleSpec('c1', 10, 20, 5),
      group
    ) as Circle;
    const ellipse = document.createShape(
      new EllipseSpec('e1', 30, 40, 6, 7),
      group
    ) as Ellipse;
    const line = document.createShape(
      new LineSpec('l1', 1, 2, 3, 4),
      group
    ) as Line;

    rect.set(ShapeAttributeUpdate.number('x', 15));
    rect.set(ShapeAttributeUpdate.text('fill', '#3366ff'));
    rect.set(ShapeAttributeUpdate.number('stroke-width', 2.5));
    text.set(ShapeAttributeUpdate.text('text', 'after'));
    group.set(ShapeAttributeUpdate.text('stroke', 'red'));
    circle.set(ShapeAttributeUpdate.number('r', 15));
    ellipse.set(ShapeAttributeUpdate.number('ry', 9));
    line.set(ShapeAttributeUpdate.number('x2', 8));
    text.set(ShapeAttributeUpdate.number('x', 7));

    expect(rect).toMatchObject({
      x: 15,
      y: 20,
      width: 30,
      height: 40,
      fill: '#3366ff',
      strokeWidth: 2.5
    });
    expect(text.content).toBe('after');
    expect(text.fill).toBeUndefined();
    expect(group.stroke).toBe('red');
    expect(rect.stroke).toBeUndefined();
    expect(circle.r).toBe(15);
    expect(ellipse.ry).toBe(9);
    expect(line.x2).toBe(8);
    expect(text.x).toBe(7);
    expect(() =>
      rect.set(ShapeAttributeUpdate.number('cx', 10))
    ).toThrow(
      'unknown attribute: cx'
    );
    expect(() =>
      rect.set(ShapeAttributeUpdate.number('font-size', 12))
    ).toThrow(
      'unknown attribute: font-size'
    );
    expect(() =>
      text.set(ShapeAttributeUpdate.text('text-anchor', 'middle'))
    ).toThrow(
      'unknown attribute: text-anchor'
    );
    expect(() =>
      ShapeAttributeUpdate.number('width', Number.NaN)
    ).toThrow(
      'width must be a finite number'
    );
    expect(() =>
      text.set(ShapeAttributeUpdate.text('text', ''))
    ).toThrow('text must not be empty');
    expect(() =>
      circle.set(ShapeAttributeUpdate.number('r', -1))
    ).toThrow('r must be positive');
    expect(text.content).toBe('after');
    expect(circle.r).toBe(15);
    expect(rect).toMatchObject({ x: 15, y: 20, width: 30, height: 40 });
  });

  it('[GEO-01/03/05] moves and scales each leaf geometry', () => {
    const document = new SvgDocument(400, 300);
    const circle = document.createShape(
      new CircleSpec('c1', 10, 20, 5)
    ) as Circle;
    const ellipse = document.createShape(
      new EllipseSpec('e1', 30, 40, 6, 7)
    ) as Ellipse;
    const line = document.createShape(
      new LineSpec('l1', 1, 2, 3, 4)
    ) as Line;
    const text = document.createShape(
      new TextSpec('t1', 5, 6, 'label')
    ) as Text;

    circle.move(2, 3);
    ellipse.move(4, 5);
    line.move(6, 7);
    text.move(8, 9);

    expect(circle).toMatchObject({ cx: 12, cy: 23, r: 5 });
    expect(ellipse).toMatchObject({ cx: 34, cy: 45, rx: 6, ry: 7 });
    expect(line).toMatchObject({ x1: 7, y1: 9, x2: 9, y2: 11 });
    expect(text).toMatchObject({ x: 13, y: 15 });

    circle.scale(2);
    ellipse.scale(2);
    line.scale(2);
    text.scale(2);

    expect(circle).toMatchObject({ cx: 24, cy: 46, r: 10 });
    expect(ellipse).toMatchObject({ cx: 68, cy: 90, rx: 12, ry: 14 });
    expect(line).toMatchObject({ x1: 14, y1: 18, x2: 18, y2: 22 });
    expect(text).toMatchObject({ x: 26, y: 30 });
  });

  it('[GEO-01/02/03/04/05/07] moves and scales leaves and nested groups atomically', () => {
    const document = new SvgDocument(800, 600);
    const outer = document.createShape(new GroupSpec('outer')) as Group;
    const inner = document.createShape(
      new GroupSpec('inner'),
      outer
    ) as Group;
    const rect = document.createShape(
      new RectSpec('r1', 10, 20, 30, 40),
      inner
    ) as Rect;
    const text = document.createShape(
      new TextSpec('t1', 5, 7, 'label'),
      outer
    ) as Text;

    outer.move(2, -3);

    expect(rect).toMatchObject({ x: 12, y: 17, width: 30, height: 40 });
    expect(text).toMatchObject({ x: 7, y: 4 });

    outer.scale(2);

    expect(rect).toMatchObject({ x: 24, y: 34, width: 60, height: 80 });
    expect(text).toMatchObject({ x: 14, y: 8 });

    rect.set(ShapeAttributeUpdate.number('x', Number.MAX_VALUE));
    const rectBeforeFailure = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    };
    const textBeforeFailure = { x: text.x, y: text.y };

    expect(() => outer.scale(2)).toThrow(
      'scaled geometry must be finite numbers'
    );
    expect(rect.x).toBe(rectBeforeFailure.x);
    expect(rect.y).toBe(rectBeforeFailure.y);
    expect(rect.width).toBe(rectBeforeFailure.width);
    expect(rect.height).toBe(rectBeforeFailure.height);
    expect(text.x).toBe(textBeforeFailure.x);
    expect(text.y).toBe(textBeforeFailure.y);

    expect(() => outer.move(Number.MAX_VALUE, 0)).toThrow(
      'moved geometry must be finite numbers'
    );
    expect(rect.x).toBe(rectBeforeFailure.x);
    expect(text.x).toBe(textBeforeFailure.x);
  });
});
