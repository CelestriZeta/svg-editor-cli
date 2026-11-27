import { describe, expect, it } from 'vitest';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { ShapeSpecWithChildren } from '../../src/domain/specs/ShapeSpecWithChildren.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { GuardedSpec } from '../support/GuardedSpec.js';
import { CreateShapeCommand } from '../../src/plugins/builtin-commands/commands/CreateShapeCommand.js';
import { CommandExecutor } from '../../src/application/CommandExecutor.js';
import { CommandHistory } from '../../src/application/CommandHistory.js';
import { DomainError } from '../../src/domain/DomainError.js';
import { ShapeTree } from '../../src/domain/document/ShapeTree.js';
import type { ShapeRelations } from '../../src/domain/shapes/ShapeRelations.js';

describe('complete candidate subtrees and structural invariants', () => {
  it('prepares without publishing, then creates and redoes a whole subtree as one history unit', async () => {
    const document = new SvgDocument(100, 100);
    const spec = new ShapeSpecWithChildren(new GroupSpec('outer'), [new GuardedSpec('p')]);
    document.prepareCreateShape(spec);
    expect(document.elementCount).toBe(0);
    const history = new CommandHistory();
    await new CommandExecutor(history).execute(new CreateShapeCommand(document, spec));
    expect(document.elementCount).toBe(3);
    expect(history.undoCount()).toBe(1);
    const root = document.requireShape('outer');
    const core = document.requireShape('p-core');
    expect(document.parentOf('p')?.id).toBe('outer');
    expect(document.parentOf('p-core')?.id).toBe('p');
    await history.undo();
    expect(document.elementCount).toBe(0);
    await history.redo();
    expect(document.requireShape('outer')).toBe(root);
    expect(document.requireShape('p-core')).toBe(core);
    expect(document.elementCount).toBe(3);
  });

  it('rejects collisions in descendants without leaving a root or clearing redo', async () => {
    const document = new SvgDocument(100, 100);
    const existing = document.createShape(new RectSpec('p-core', 0, 0, 1, 1));
    const history = new CommandHistory();
    const executor = new CommandExecutor(history);
    await executor.execute(new CreateShapeCommand(document, new RectSpec('temporary', 0, 0, 1, 1)));
    await history.undo();
    const result = await executor.execute(new CreateShapeCommand(document, new GuardedSpec('p')));
    expect(result).toMatchObject({ succeeded: false, text: 'id already exists: p-core' });
    expect(document.elementCount).toBe(1);
    expect(document.findShape('p')).toBeUndefined();
    expect(document.requireShape('p-core')).toBe(existing);
    expect(history.undoCount()).toBe(0);
    expect(history.redoCount()).toBe(1);
  });

  it('rejects internal duplicates, leaf children and incomplete composite specifications', () => {
    const document = new SvgDocument(100, 100);
    expect(() => document.prepareCreateShape(new ShapeSpecWithChildren(new GroupSpec('root'), [
      new RectSpec('same', 0, 0, 1, 1), new RectSpec('same', 0, 0, 1, 1)
    ]))).toThrow('id already exists: same');
    expect(() => document.prepareCreateShape(new ShapeSpecWithChildren(new RectSpec('leaf', 0, 0, 1, 1), [
      new GroupSpec('child')
    ]))).toThrow('shape cannot contain child specifications: leaf');
    expect(() => document.prepareCreateShape(new GuardedSpec('p', []))).toThrow('required core missing: p');
    expect(() => document.prepareCreateShape(new GuardedSpec('p', [new GroupSpec('p-core')]))).toThrow('required core missing: p');
    expect(document.elementCount).toBe(0);
    expect(document.createShape(new RectSpec('same', 0, 0, 1, 1)).id).toBe('same');
  });

  it('revalidates a prepared insertion against changes made before apply', () => {
    const document = new SvgDocument(100, 100);
    const insertion = document.prepareCreateShape(new GuardedSpec('p'));
    document.createShape(new RectSpec('p-core', 0, 0, 1, 1));
    expect(() => insertion.apply()).toThrow('id already exists: p-core');
    expect(document.elementCount).toBe(1);
    expect(document.findShape('p')).toBeUndefined();
  });

  it('protects necessary parts on delete, move and grouping, and refuses composite dissolution', () => {
    const document = new SvgDocument(100, 100);
    const composite = document.createShape(new GuardedSpec('p'));
    const core = document.requireShape('p-core');
    document.createShape(new GroupSpec('destination'));
    document.createShape(new RectSpec('loose', 0, 0, 1, 1));
    const before = [...document.children];
    for (const prepare of [
      () => document.prepareDeleteShape('p-core'),
      () => document.prepareAddTo('destination', 'p-core'),
      () => document.prepareGroup('stolen', ['p-core', 'loose'])
    ]) expect(prepare).toThrow('required core missing: p');
    expect(() => document.prepareUngroup('p')).toThrow('cannot ungroup composite shape: p');
    expect([...document.children]).toEqual(before);
    expect(document.findShape('stolen')).toBeUndefined();
    expect(core.parent).toBe(composite);
    expect(document.elementCount).toBe(4);
  });

  it('allows extra children, reordering and whole-composite removal with exact restoration', () => {
    const document = new SvgDocument(100, 100);
    const composite = document.createShape(new GuardedSpec('p'));
    document.createShape(new RectSpec('extra', 0, 0, 1, 1), document.requireContainer('p'));
    const reorder = document.prepareFront('p-core');
    reorder.apply();
    expect([...document.requireContainer('p').children].map((node) => node.id)).toEqual(['extra', 'p-core']);
    reorder.revert();
    const removal = document.prepareDeleteShape('p');
    removal.apply();
    expect(document.elementCount).toBe(0);
    removal.revert();
    expect(document.requireShape('p')).toBe(composite);
    expect([...document.requireContainer('p').children].map((node) => node.id)).toEqual(['p-core', 'extra']);
  });

  it('keeps preserved descendants consistent when an insertion is reapplied', () => {
    const document = new SvgDocument(100, 100);
    const insertion = document.prepareCreateShape(new GuardedSpec('p'));
    insertion.apply();
    const extra = document.createShape(new GroupSpec('extra'), document.requireContainer('p'));
    insertion.revert();
    insertion.apply();
    expect(document.elementCount).toBe(3);
    expect(document.requireShape('extra')).toBe(extra);
    expect(document.parentOf('extra')?.id).toBe('p');
    expect([...document.requireContainer('p').children].map((child) => child.id)).toEqual(['p-core', 'extra']);
  });

  it('can remove ancestors or dissolve an ordinary group without breaking nested composites', () => {
    const document = new SvgDocument(100, 100);
    document.createShape(new ShapeSpecWithChildren(new GroupSpec('outer'), [
      new ShapeSpecWithChildren(new GroupSpec('inner'), [new GuardedSpec('p')])
    ]));
    const composite = document.requireShape('p');
    const dissolve = document.prepareUngroup('inner');
    dissolve.apply();
    expect(document.parentOf('p')?.id).toBe('outer');
    expect(document.parentOf('p-core')).toBe(composite);
    dissolve.revert();
    expect(document.parentOf('p')?.id).toBe('inner');
    const remove = document.prepareDeleteShape('outer');
    remove.apply();
    expect(document.elementCount).toBe(0);
    remove.revert();
    expect(document.requireShape('p')).toBe(composite);
    expect(document.elementCount).toBe(4);
  });

  it.each(['undo', 'redo'] as const)('keeps document and history if a %s structure validator throws', async (direction) => {
    const document = new SvgDocument(100, 100);
    const composite = document.createShape(new GuardedSpec('p'));
    const history = new CommandHistory();
    await new CommandExecutor(history).execute(new CreateShapeCommand(document,
      new RectSpec('extra', 0, 0, 1, 1), document.requireContainer('p')));
    if (direction === 'redo') await history.undo();
    const before = {
      count: document.elementCount, children: [...document.requireContainer('p').children],
      undo: history.undoCount(), redo: history.redoCount(), blocked: history.isBlocked()
    };
    Object.defineProperty(composite, 'validateStructure', { value: () => { throw new DomainError('validation failed'); } });
    expect(await history[direction]()).toMatchObject({ succeeded: false, text: 'validation failed' });
    expect(document.elementCount).toBe(before.count);
    expect([...document.requireContainer('p').children]).toEqual(before.children);
    expect(history.undoCount()).toBe(before.undo);
    expect(history.redoCount()).toBe(before.redo);
    expect(history.isBlocked()).toBe(before.blocked);
  });

  it('compensates earlier structural writes when a later relocation throws', () => {
    const document = new SvgDocument(100, 100);
    document.createShape(new GuardedSpec('p'));
    document.createShape(new RectSpec('loose', 0, 0, 1, 1));
    const composite = document.requireShape('p');
    const before = [...document.children];
    const grouping = document.prepareGroup('cluster', ['p', 'loose']);
    const original = ShapeTree.prototype.relocate;
    let calls = 0;
    ShapeTree.prototype.relocate = function (...args: Parameters<typeof original>): void {
      if (++calls === 2) throw new Error('relocation failed');
      original.apply(this, args);
    };
    try {
      expect(() => grouping.apply()).toThrow('relocation failed');
      expect([...document.children]).toEqual(before);
      expect(document.elementCount).toBe(3);
      expect(document.findShape('cluster')).toBeUndefined();
      expect(document.requireShape('p-core').parent).toBe(composite);
      expect(composite.parent).toBeUndefined();
    } finally {
      ShapeTree.prototype.relocate = original;
    }
  });

  it('copies specification children and abandons construction failures before publication', () => {
    const members = [new GroupSpec('child')];
    const spec = new ShapeSpecWithChildren(new GroupSpec('root'), members);
    members.length = 0;
    expect(spec.children.map((child) => child.id)).toEqual(['child']);
    expect(Object.isFrozen(spec.children)).toBe(true);
    const failure = new GroupSpec('failure');
    Object.defineProperty(failure, 'create', { value: () => { throw new Error('construction failed'); } });
    const document = new SvgDocument(100, 100);
    expect(() => document.prepareCreateShape(new ShapeSpecWithChildren(new GroupSpec('root'), [
      new GroupSpec('created-first'), failure
    ]))).toThrow('construction failed');
    expect(document.elementCount).toBe(0);
    expect([...document.children]).toEqual([]);
  });

  it('validates placement constraints in the final parent context, not the detached staging tree', () => {
    const document = new SvgDocument(100, 100);
    document.createShape(new GroupSpec('outer'));
    const outer = document.requireContainer('outer');
    const spec = new GuardedSpec('p');
    const create = spec.create.bind(spec);
    Object.defineProperty(spec, 'create', { value: (relations: ShapeRelations) => {
      const shape = create(relations);
      const validate = shape.validateStructure.bind(shape);
      Object.defineProperty(shape, 'validateStructure', { value: (candidate: ShapeRelations) => {
        validate(candidate);
        if (candidate.parentOf(shape) !== outer) throw new DomainError('must be inside outer');
      } });
      return shape;
    } });
    const shape = document.createShape(spec, outer);
    expect(shape.parent).toBe(outer);
    expect(document.parentOf('p-core')).toBe(shape);
    expect(document.elementCount).toBe(3);
  });

  it('rejects stale ungroup plans instead of dropping a child added after preparation', () => {
    const document = new SvgDocument(100, 100);
    document.createShape(new ShapeSpecWithChildren(new GroupSpec('outer'), [
      new ShapeSpecWithChildren(new GroupSpec('inner'), [new GroupSpec('original')])
    ]));
    const change = document.prepareUngroup('inner');
    const added = document.createShape(new GroupSpec('added'), document.requireContainer('inner'));
    expect(() => change.apply()).toThrow('container structure changed: inner');
    expect(document.elementCount).toBe(4);
    expect(document.requireShape('added')).toBe(added);
    expect(document.parentOf('added')?.id).toBe('inner');
    expect(document.parentOf('original')?.id).toBe('inner');
  });

  it.each(['parent', 'order'] as const)('rejects ungroup after its source %s changes', (changed) => {
    const document = new SvgDocument(100, 100);
    document.createShape(new ShapeSpecWithChildren(new GroupSpec('outer'), [
      new ShapeSpecWithChildren(new GroupSpec('inner'), [new GroupSpec('child')]),
      new GroupSpec('sibling')
    ]));
    document.createShape(new GroupSpec('other'));
    const change = document.prepareUngroup('inner');
    if (changed === 'parent') document.prepareAddTo('other', 'inner').apply();
    else document.prepareFront('inner').apply();
    const parent = document.parentOf('inner');
    const siblings = [...document.requireContainer(parent?.id ?? 'outer').children];
    expect(() => change.apply()).toThrow('container structure changed: inner');
    expect(document.elementCount).toBe(5);
    expect(document.parentOf('inner')).toBe(parent);
    expect([...document.requireContainer(parent?.id ?? 'outer').children]).toEqual(siblings);
    expect(document.parentOf('child')?.id).toBe('inner');
  });

  it('validates grouping after all relocations rather than rejecting its temporary empty container', () => {
    const document = new SvgDocument(100, 100);
    document.createShape(new RectSpec('a', 0, 0, 1, 1));
    document.createShape(new RectSpec('b', 0, 0, 1, 1));
    const original = GroupSpec.prototype.create;
    GroupSpec.prototype.create = function (this: GroupSpec, relations: ShapeRelations) {
      const group = original.call(this, relations);
      Object.defineProperty(group, 'validateStructure', { value: (candidate: ShapeRelations) => {
        if ([...candidate.childrenOf(group)].length !== 2) throw new DomainError('two children required');
      } });
      return group;
    };
    try {
      const grouping = document.prepareGroup('pair', ['a', 'b']);
      grouping.apply();
      expect([...document.requireContainer('pair').children].map((node) => node.id)).toEqual(['a', 'b']);
      grouping.revert();
      expect([...document.children].map((node) => node.id)).toEqual(['a', 'b']);
      grouping.apply();
      expect(document.parentOf('a')?.id).toBe('pair');
    } finally {
      GroupSpec.prototype.create = original;
    }
  });
});
