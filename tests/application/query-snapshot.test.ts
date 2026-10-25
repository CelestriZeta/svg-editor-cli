import { describe, expect, it, vi } from 'vitest';

import { DocumentViewVisitor } from '../../src/application/queries/DocumentViewVisitor.js';
import { GeometrySnapshot } from '../../src/application/queries/GeometrySnapshot.js';
import { ShapeAnchor } from '../../src/application/queries/ShapeAnchor.js';
import { ShowFormatter } from '../../src/cli/ShowFormatter.js';
import { TreeFormatter } from '../../src/cli/TreeFormatter.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { TextSpec } from '../../src/domain/specs/TextSpec.js';
import { LineSpec } from '../../src/domain/specs/LineSpec.js';

describe('immutable query snapshots', () => {
  it('keeps captured geometry, style, parent and children independent of later edits', () => {
    const document = new SvgDocument(100, 100);
    const group = document.createShape(new GroupSpec('g1'));
    const rect = document.createShape(new RectSpec('r1', 1, 2, 3, 4), document.requireContainer(group.id));
    const visitor = new DocumentViewVisitor();
    const snapshot = visitor.visit(document);
    const details = visitor.inspect(rect);
    const tree = new TreeFormatter();
    const show = new ShowFormatter();
    const beforeTree = tree.format(snapshot);
    const beforeShow = show.format(details);

    rect.move(10, 20);
    rect.set(ShapeAttributeUpdate.text('fill', 'red'));
    document.createShape(new RectSpec('r2', 0, 0, 1, 1));
    document.prepareGroup('other', ['g1', 'r2']).apply();

    expect(tree.format(snapshot)).toBe(beforeTree);
    expect(show.format(details)).toBe(beforeShow);
    expect(tree.format(visitor.visit(document))).not.toBe(beforeTree);
    expect(Object.isFrozen(snapshot.children)).toBe(true);
    expect(Object.isFrozen(details)).toBe(true);
    expect(Object.isFrozen(details.geometry)).toBe(true);
    expect(Object.isFrozen(details.geometry.attributes)).toBe(true);
    expect(Object.isFrozen(details.geometry.attributes[0])).toBe(true);
    expect(Object.isFrozen(details.geometry.anchor)).toBe(true);
  });

  it('inspects a container without visiting children or affecting later tree queries', () => {
    const document = new SvgDocument(100, 100);
    const group = document.createShape(new GroupSpec('g1'));
    const rect = document.createShape(new RectSpec('r1', 1, 2, 3, 4), document.requireContainer(group.id));
    const visitor = new DocumentViewVisitor();
    const before = visitor.visit(document);
    const accept = vi.spyOn(rect, 'accept').mockImplementation(() => {
      throw new Error('child must not be visited');
    });

    expect(visitor.inspect(group).children).toEqual([]);
    expect(accept).not.toHaveBeenCalled();
    accept.mockRestore();
    expect(visitor.visit(document)).toEqual(before);
  });

  it('copies numeric attributes and preserves text whitespace and segment output', () => {
    const attributes: ['x' | 'y', number][] = [['x', 1], ['y', 2]];
    const geometry = GeometrySnapshot.named(attributes, new ShapeAnchor(1, 2));
    attributes[0]![1] = 99;
    attributes.push(['x', 5]);
    expect(geometry.attributes).toEqual([['x', 1], ['y', 2]]);

    const document = new SvgDocument(100, 100);
    const text = document.createShape(new TextSpec('t1', -1, 2, ' '));
    const line = document.createShape(new LineSpec('l1', -1, 2, 3, -4));
    const visitor = new DocumentViewVisitor();
    const show = new ShowFormatter();
    expect(show.format(visitor.inspect(text))).toBe('text#t1  parent=svg\n  (-1,2) " "');
    expect(show.format(visitor.inspect(line))).toBe('line#l1  parent=svg\n  (-1,2) -> (3,-4)');
  });
});
