import { describe, expect, it } from 'vitest';

import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Rect } from '../../src/domain/shapes/Rect.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';

describe('SvgDocument', () => {
  it('[CREATE-01] creates and removes a rect through typed specifications', () => {
    const document = new SvgDocument(800, 600);
    const shape = document.createShape(new RectSpec('r1', 10, 20, 100, 50));
    const [created] = [...document.children];

    expect(created).toBeInstanceOf(Rect);
    expect(shape.id).toBe('r1');
    expect(document.elementCount).toBe(1);

    document.deleteShape('r1');

    expect(document.elementCount).toBe(0);
    expect([...document.children]).toEqual([]);
  });
});
