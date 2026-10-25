import { describe, expect, it } from 'vitest';

import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Group } from '../../src/domain/shapes/Group.js';
import type { Shape } from '../../src/domain/shapes/Shape.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { CircleSpec } from '../../src/domain/specs/CircleSpec.js';
import { EllipseSpec } from '../../src/domain/specs/EllipseSpec.js';
import { LineSpec } from '../../src/domain/specs/LineSpec.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { TextSpec } from '../../src/domain/specs/TextSpec.js';

interface TreeSnapshot {
  readonly id: string;
  readonly children: readonly TreeSnapshot[];
}

function snapshotChildren(children: Iterable<Shape>): readonly TreeSnapshot[] {
  return [...children].map((shape) => ({
    id: shape.id,
    children: shape instanceof Group ? snapshotChildren(shape.children) : []
  }));
}

function snapshot(document: SvgDocument): readonly TreeSnapshot[] {
  return snapshotChildren(document.children);
}

function childIds(shape: Group): readonly string[] {
  return [...shape.children].map((child) => child.id);
}

describe('SvgDocument structural editing', () => {
  it('[CREATE-11] creates all six built-in shapes as ordered container children', () => {
    const document = new SvgDocument(100, 100);
    const parent = document.createShape(new GroupSpec('parent')) as Group;

    document.createShape(new RectSpec('rect', 0, 0, 1, 1), parent);
    document.createShape(new CircleSpec('circle', 0, 0, 1), parent);
    document.createShape(new EllipseSpec('ellipse', 0, 0, 1, 1), parent);
    document.createShape(new LineSpec('line', 0, 0, 1, 1), parent);
    document.createShape(new TextSpec('text', 0, 0, 'label'), parent);
    document.createShape(new GroupSpec('group'), parent);

    expect(childIds(parent)).toEqual([
      'rect',
      'circle',
      'ellipse',
      'line',
      'text',
      'group'
    ]);
    [...parent.children].forEach((child) => expect(child.parent).toBe(parent));
  });

  it('[TREE-01/02/12, CHANGE-06/10] groups targets in command order at their common ancestor', () => {
    const document = new SvgDocument(400, 300);
    const first = document.createShape(new GroupSpec('first')) as Group;
    const second = document.createShape(new GroupSpec('second')) as Group;
    document.createShape(new RectSpec('r1', 1, 2, 3, 4), first);
    document.createShape(new RectSpec('r2', 5, 6, 7, 8), first);
    document.createShape(new RectSpec('r3', 9, 10, 11, 12), second);
    const before = snapshot(document);

    const change = document.prepareGroup('cluster', ['r3', 'r2']);

    expect(snapshot(document)).toEqual(before);
    change.apply();
    const cluster = document.requireShape('cluster') as Group;
    expect([...document.children].map((shape) => shape.id)).toEqual([
      'first',
      'second',
      'cluster'
    ]);
    expect(childIds(first)).toEqual(['r1']);
    expect(childIds(second)).toEqual([]);
    expect(childIds(cluster)).toEqual(['r3', 'r2']);
    expect(document.parentOf('r3')).toBe(cluster);
    expect(document.parentOf('r2')).toBe(cluster);

    change.revert();
    expect(snapshot(document)).toEqual(before);
    expect(document.findShape('cluster')).toBeUndefined();

    change.apply();
    expect(childIds(document.requireShape('first') as Group)).toEqual(['r1']);
    expect(childIds(document.requireShape('cluster') as Group)).toEqual(['r3', 'r2']);
  });

  it('[TREE-01] keeps unselected siblings stable when grouping within one parent', () => {
    const document = new SvgDocument(100, 100);
    const group = document.createShape(new GroupSpec('g1')) as Group;
    document.createShape(new RectSpec('r1', 0, 0, 1, 1), group);
    document.createShape(new RectSpec('r2', 0, 0, 1, 1), group);
    document.createShape(new RectSpec('r3', 0, 0, 1, 1), group);
    const before = snapshot(document);

    const change = document.prepareGroup('inner', ['r3', 'r1']);
    change.apply();

    expect(childIds(group)).toEqual(['r2', 'inner']);
    expect(childIds(document.requireShape('inner') as Group)).toEqual(['r3', 'r1']);
    change.revert();
    expect(snapshot(document)).toEqual(before);
  });

  it('[TREE-03/04] rejects invalid group requests without partial mutation', () => {
    const document = new SvgDocument(100, 100);
    const group = document.createShape(new GroupSpec('g1')) as Group;
    document.createShape(new RectSpec('r1', 0, 0, 1, 1), group);
    const before = snapshot(document);

    expect(() => document.prepareGroup('g1', ['r1'])).toThrow(
      'id already exists: g1'
    );
    expect(() => document.prepareGroup('cluster', ['r1'])).toThrow(
      'group requires at least two shapes'
    );
    expect(() => document.prepareGroup('cluster', ['r1', 'r1'])).toThrow(
      'duplicate group target: r1'
    );
    expect(() => document.prepareGroup('cluster', ['r1', 'missing'])).toThrow(
      'no such shape: missing'
    );
    expect(() => document.prepareGroup('cluster', ['g1', 'r1'])).toThrow(
      'cannot group a container into its own descendant: g1'
    );
    expect(snapshot(document)).toEqual(before);
  });

  it('[TREE-05/06/07/13, CHANGE-07] ungroups in place and restores the same group', () => {
    const document = new SvgDocument(100, 100);
    const outer = document.createShape(new GroupSpec('outer')) as Group;
    document.createShape(new RectSpec('a', 0, 0, 1, 1), outer);
    const group = document.createShape(new GroupSpec('g1'), outer) as Group;
    document.createShape(new RectSpec('r1', 0, 0, 1, 1), group);
    document.createShape(new RectSpec('r2', 0, 0, 1, 1), group);
    document.createShape(new RectSpec('z', 0, 0, 1, 1), outer);
    const before = snapshot(document);

    const change = document.prepareUngroup('g1');
    change.apply();

    expect([...outer.children].map((shape) => shape.id)).toEqual([
      'a',
      'r1',
      'r2',
      'z'
    ]);
    expect(document.parentOf('r1')).toBe(outer);
    expect(document.parentOf('r2')).toBe(outer);
    expect(document.findShape('g1')).toBeUndefined();

    change.revert();
    expect(snapshot(document)).toEqual(before);
    expect(document.findShape('g1')).toBe(group);
    expect([...group.children].map((shape) => shape.id)).toEqual(['r1', 'r2']);
    change.apply();
    expect([...outer.children].map((shape) => shape.id)).toEqual([
      'a',
      'r1',
      'r2',
      'z'
    ]);
    change.revert();
    expect(snapshot(document)).toEqual(before);
    expect(() => document.prepareUngroup('g1')).not.toThrow();

    document.createShape(new GroupSpec('top'));
    expect(() => document.prepareUngroup('top')).toThrow(
      'cannot ungroup top-level container: top'
    );
    expect(() => document.prepareUngroup('a')).toThrow('not a container: a');
  });

  it('[TREE-08/09, CHANGE-08] moves a shape to the target container and rejects cycles', () => {
    const document = new SvgDocument(100, 100);
    const outer = document.createShape(new GroupSpec('outer')) as Group;
    const inner = document.createShape(new GroupSpec('inner'), outer) as Group;
    document.createShape(new RectSpec('r1', 0, 0, 1, 1));
    const before = snapshot(document);

    const change = document.prepareAddTo('inner', 'r1');
    change.apply();
    expect([...document.children].map((shape) => shape.id)).toEqual(['outer']);
    expect([...inner.children].map((shape) => shape.id)).toEqual(['r1']);

    change.revert();
    expect(snapshot(document)).toEqual(before);

    const addAgain = document.prepareAddTo('inner', 'r1');
    addAgain.apply();
    document.createShape(new RectSpec('r2', 0, 0, 1, 1), inner);
    const reorder = document.prepareAddTo('inner', 'r1');
    expect(reorder.hasChanges).toBe(true);
    reorder.apply();
    expect([...inner.children].map((shape) => shape.id)).toEqual(['r2', 'r1']);
    expect(document.prepareAddTo('inner', 'r1').hasChanges).toBe(false);
    reorder.revert();
    expect([...inner.children].map((shape) => shape.id)).toEqual(['r1', 'r2']);
    document.deleteShape('r2');
    addAgain.revert();
    expect(snapshot(document)).toEqual(before);

    expect(() => document.prepareAddTo('inner', 'outer')).toThrow(
      'cannot move a container into its own descendant: outer'
    );
    expect(() => document.prepareAddTo('missing', 'r1')).toThrow(
      'no such container: missing'
    );
    expect(() => document.prepareAddTo('r1', 'outer')).toThrow(
      'not a container: r1'
    );
    expect(snapshot(document)).toEqual(before);
  });

  it('[TREE-10/11, CHANGE-09] reorders siblings and represents boundary operations as empty', () => {
    const document = new SvgDocument(100, 100);
    document.createShape(new RectSpec('r1', 0, 0, 1, 1));
    document.createShape(new RectSpec('r2', 0, 0, 1, 1));
    document.createShape(new RectSpec('r3', 0, 0, 1, 1));
    const before = snapshot(document);

    const front = document.prepareFront('r2');
    expect(front.hasChanges).toBe(true);
    front.apply();
    expect([...document.children].map((shape) => shape.id)).toEqual(['r1', 'r3', 'r2']);
    front.revert();
    expect(snapshot(document)).toEqual(before);

    const back = document.prepareBack('r3');
    back.apply();
    expect([...document.children].map((shape) => shape.id)).toEqual(['r3', 'r1', 'r2']);
    back.revert();
    expect(snapshot(document)).toEqual(before);

    expect(document.prepareFront('r3').hasChanges).toBe(false);
    expect(document.prepareBack('r1').hasChanges).toBe(false);
    expect(snapshot(document)).toEqual(before);
  });

  it('[CHANGE-01/02, CREATE-11] records exact create and delete tree changes', () => {
    const document = new SvgDocument(100, 100);
    const parent = document.createShape(new GroupSpec('parent')) as Group;
    const create = document.prepareCreateShape(
      new RectSpec('r1', 1, 2, 3, 4),
      parent
    );

    create.apply();
    const created = document.requireShape('r1');
    expect(document.parentOf('r1')).toBe(parent);
    create.revert();
    expect(document.findShape('r1')).toBeUndefined();
    create.apply();
    expect(document.requireShape('r1')).toBe(created);

    const deletion = document.prepareDeleteShape('parent');
    deletion.apply();
    expect(document.findShape('parent')).toBeUndefined();
    expect(document.findShape('r1')).toBeUndefined();
    deletion.revert();
    expect(document.requireShape('parent')).toBe(parent);
    expect(document.requireShape('r1')).toBe(created);
    expect(document.parentOf('r1')).toBe(parent);
    deletion.apply();
    expect(document.findShape('parent')).toBeUndefined();
  });
});
