import { describe, expect, it } from 'vitest';

import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Group } from '../../src/domain/shapes/Group.js';
import { Rect } from '../../src/domain/shapes/Rect.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { ShapeVisitor } from '../../src/domain/visitor/ShapeVisitor.js';

describe('Group composite', () => {
  it('[GEO-02/04/08/09] traverses nested children and supports subtree skipping', () => {
    const document = new SvgDocument(800, 600);
    const flow = document.createShape(new GroupSpec('flow')) as Group;
    const node = document.createShape(new GroupSpec('node'), flow) as Group;
    const skipped = document.createShape(
      new GroupSpec('skipped'),
      flow
    ) as Group;
    document.createShape(new RectSpec('start', 1, 2, 3, 4), node);
    document.createShape(new RectSpec('hidden', 5, 6, 7, 8), skipped);
    const tail = document.createShape(new GroupSpec('tail'), flow) as Group;
    document.createShape(new RectSpec('end', 9, 10, 11, 12), tail);
    const visitor = new RecordingVisitor();

    expect(flow.accept(visitor)).toEqual([
      'enter:flow',
      'enter:node',
      'rect:start',
      'leave:node',
      'enter:skipped',
      'leave:skipped',
      'enter:tail',
      'rect:end',
      'leave:tail',
      'leave:flow'
    ]);
  });

  it('[DELETE-01/02] deletes a leaf or complete subtree with its ids', () => {
    const document = new SvgDocument(800, 600);
    const group = document.createShape(new GroupSpec('g1')) as Group;
    const node = document.createShape(new GroupSpec('node'), group) as Group;
    const rect = document.createShape(
      new RectSpec('r1', 1, 2, 3, 4),
      node
    ) as Rect;
    document.createShape(new RectSpec('sibling', 5, 6, 7, 8));

    expect(document.elementCount).toBe(4);
    expect(document.parentOf('node')).toBe(group);
    expect(document.parentOf('r1')).toBe(node);

    document.deleteShape('r1');

    expect(document.findShape('r1')).toBeUndefined();
    expect(rect.parent).toBeUndefined();
    expect(document.elementCount).toBe(3);

    document.deleteShape('g1');

    expect(document.findShape('g1')).toBeUndefined();
    expect(document.findShape('node')).toBeUndefined();
    expect(document.elementCount).toBe(1);
    expect([...document.children].map((shape) => shape.id)).toEqual([
      'sibling'
    ]);
    expect(node.parent).toBe(group);
  });

  it('[TREE-04/08] rejects cycles before changing the tree', () => {
    const document = new SvgDocument(800, 600);
    const outer = document.createShape(new GroupSpec('outer')) as Group;
    const inner = document.createShape(new GroupSpec('inner'), outer) as Group;

    expect(() => document.prepareAddTo('inner', 'outer')).toThrow(
      'cannot move a container into its own descendant: outer'
    );
    for (const factor of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => outer.scale(factor)).toThrow(
        'scale factor must be positive'
      );
    }
    expect([...outer.children]).toEqual([inner]);
    expect([...inner.children]).toEqual([]);
    expect(document.findShape('outer')).toBe(outer);
  });
});

class RecordingVisitor extends ShapeVisitor<readonly string[]> {
  public enterGroup(group: Group): boolean {
    return group.id !== 'skipped';
  }

  public leaveGroup(
    group: Group,
    children: readonly (readonly string[])[]
  ): readonly string[] {
    return [
      `enter:${group.id}`,
      ...children.flatMap((result) => result),
      `leave:${group.id}`
    ];
  }

  public visitCircle(): readonly string[] {
    return [];
  }

  public visitEllipse(): readonly string[] {
    return [];
  }

  public visitLine(): readonly string[] {
    return [];
  }

  public visitRect(rect: Rect): readonly string[] {
    return [`rect:${rect.id}`];
  }

  public visitText(): readonly string[] {
    return [];
  }
}
