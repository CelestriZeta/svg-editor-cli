import { describe, expect, it } from 'vitest';
import { ArrowPlugin } from '../../src/plugins/shape-arrow/ArrowPlugin.js';
import { ArrowProvider } from '../../src/plugins/shape-arrow/ArrowProvider.js';
import { ArrowShape } from '../../src/plugins/shape-arrow/ArrowShape.js';
import type { ShapeProvider } from '../../src/application/extensions/ShapeProvider.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';

describe('independent arrow plugin', () => {
  it('registers only its own shape and builds three lines without other plugins', () => {
    const providers: ShapeProvider[] = [];
    const unexpected = (): never => { throw new Error('unexpected registration'); };
    new ArrowPlugin().activate({ registerShape: p => providers.push(p), registerCommand: unexpected,
      registerAttribute: unexpected, registerDecorator: unexpected });
    expect(providers.map(p => p.name)).toEqual(['arrow']);
    const doc = new SvgDocument(200, 100);
    const change = doc.prepareCreateShape(providers[0]!.createSpec('a', ['0', '0', '60', '0']));
    change.apply();
    const arrow = doc.requireShape('a');
    expect(arrow).toBeInstanceOf(ArrowShape);
    expect(doc.elementCount).toBe(4);
    expect(arrow.stroke).toBe('black');
    expect(doc.requireShape('a-head-left').attributeValue('x2').numericValue).toBe(40);
    expect(doc.requireShape('a-head-left').attributeValue('y2').numericValue).toBe(10);
    change.revert(); expect(doc.elementCount).toBe(0);
    change.apply(); expect(doc.requireShape('a')).toBe(arrow);
  });

  it.each([[0, 60], [-60, 0], [30, 40], [0.003, 0.004]])('builds arrowheads for direction %s,%s', (x, y) => {
    const spec = new ArrowProvider().createSpec('a', ['0', '0', String(x), String(y), 'red']);
    const doc = new SvgDocument(100, 100); doc.createShape(spec);
    const left = doc.requireShape('a-head-left'), right = doc.requireShape('a-head-right');
    const lx = left.attributeValue('x2').numericValue, ly = left.attributeValue('y2').numericValue;
    const rx = right.attributeValue('x2').numericValue, ry = right.attributeValue('y2').numericValue;
    expect(Math.hypot(lx - x, ly - y)).toBeCloseTo(Math.hypot(rx - x, ry - y), 10);
    expect((lx - x) * x + (ly - y) * y).toBeLessThan(0);
  });

  it('moves/scales the whole composite and reverts exact prior values', () => {
    const doc = new SvgDocument(100, 100);
    const arrow = doc.createShape(new ArrowProvider().createSpec('a', ['1', '2', '61', '2'])) as ArrowShape;
    const move = arrow.prepareMove(3, 4); move.apply();
    expect(arrow.shaft.x1).toBe(4); expect(arrow.shaft.y1).toBe(6);
    const scale = arrow.prepareScale(2); scale.apply(); expect(arrow.shaft.x2).toBe(128);
    scale.revert(); move.revert(); expect(arrow.shaft.x1).toBe(1); expect(arrow.shaft.x2).toBe(61);
    const style = arrow.prepareSet(ShapeAttributeUpdate.text('stroke', 'blue'));
    style.apply(); expect(arrow.stroke).toBe('blue'); style.revert(); expect(arrow.stroke).toBe('black');
  });

  it.each([[], ['0','0','0','0'], ['NaN','0','1','1'], ['-1e308','0','1e308','0']].map(args => ({ args })))('rejects invalid geometry $args without publication', ({ args }) => {
    const doc = new SvgDocument(100, 100);
    expect(() => doc.createShape(new ArrowProvider().createSpec('a', args))).toThrow();
    expect(doc.elementCount).toBe(0);
  });
});
