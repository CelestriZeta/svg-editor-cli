import { describe, expect, it } from 'vitest';

import { CommandExecutor } from '../../src/application/CommandExecutor.js';
import { CommandHistory } from '../../src/application/CommandHistory.js';
import { AddToCommand } from '../../src/application/commands/AddToCommand.js';
import { BackShapeCommand } from '../../src/application/commands/BackShapeCommand.js';
import { FrontShapeCommand } from '../../src/application/commands/FrontShapeCommand.js';
import { GroupShapesCommand } from '../../src/application/commands/GroupShapesCommand.js';
import { UngroupShapeCommand } from '../../src/application/commands/UngroupShapeCommand.js';
import { GroupCreatedResult } from '../../src/application/commands/results/GroupCreatedResult.js';
import { ShapeReorderedResult } from '../../src/application/commands/results/ShapeReorderedResult.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Group } from '../../src/domain/shapes/Group.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';

describe('tree edit commands', () => {
  it('[CHANGE-06/10] keeps one structural command as one exact undo unit', async () => {
    const document = new SvgDocument(100, 100);
    const left = document.createShape(new GroupSpec('left')) as Group;
    const right = document.createShape(new GroupSpec('right')) as Group;
    document.createShape(new RectSpec('r1', 1, 2, 3, 4), left);
    document.createShape(new RectSpec('r2', 5, 6, 7, 8), right);
    const command = new GroupShapesCommand(document, 'cluster', ['r1', 'r2']);
    const history = new CommandHistory();
    const executor = new CommandExecutor(history);

    const result = await executor.execute(command);

    expect(result).toBeInstanceOf(GroupCreatedResult);
    expect((result as GroupCreatedResult).childCount).toBe(2);
    expect(history.undoCount()).toBe(1);
    const cluster = document.requireShape('cluster') as Group;
    expect([...cluster.children].map((shape) => shape.id)).toEqual(['r1', 'r2']);

    await command.undo();
    expect(document.findShape('cluster')).toBeUndefined();
    expect(document.parentOf('r1')).toBe(left);
    expect(document.parentOf('r2')).toBe(right);

    await command.redo();
    expect(document.requireShape('cluster')).toBe(cluster);
    expect(document.parentOf('r1')).toBe(cluster);
    expect(document.parentOf('r2')).toBe(cluster);
  });

  it('[TREE-11] does not create a history unit for a boundary reorder', async () => {
    const document = new SvgDocument(100, 100);
    document.createShape(new RectSpec('r1', 1, 2, 3, 4));
    const history = new CommandHistory();
    const executor = new CommandExecutor(history);
    const command = new FrontShapeCommand(document, 'r1');

    const result = await executor.execute(command);

    expect(result).toBeInstanceOf(ShapeReorderedResult);
    expect((result as ShapeReorderedResult).changed).toBe(false);
    expect(command.undoHandler).toBeUndefined();
    expect(history.undoCount()).toBe(0);
  });

  it('[CHANGE-07] restores and reapplies an exact ungroup operation', async () => {
    const document = new SvgDocument(100, 100);
    const outer = document.createShape(new GroupSpec('outer')) as Group;
    const target = document.createShape(new GroupSpec('target'), outer) as Group;
    document.createShape(new RectSpec('r1', 0, 0, 1, 1), target);
    document.createShape(new RectSpec('after', 0, 0, 1, 1), outer);
    const command = new UngroupShapeCommand(document, 'target');

    await command.execute();
    expect([...outer.children].map((shape) => shape.id)).toEqual([
      'r1',
      'after'
    ]);
    expect(document.findShape('target')).toBeUndefined();

    await command.undo();
    expect(document.requireShape('target')).toBe(target);
    expect([...target.children].map((shape) => shape.id)).toEqual(['r1']);
    expect([...outer.children].map((shape) => shape.id)).toEqual([
      'target',
      'after'
    ]);

    await command.redo();
    expect([...outer.children].map((shape) => shape.id)).toEqual([
      'r1',
      'after'
    ]);
  });

  it('[CHANGE-08] restores addto and skips a no-op history unit', async () => {
    const document = new SvgDocument(100, 100);
    const container = document.createShape(new GroupSpec('container')) as Group;
    document.createShape(new RectSpec('r1', 0, 0, 1, 1));
    const history = new CommandHistory();
    const executor = new CommandExecutor(history);
    const command = new AddToCommand(document, 'container', 'r1');

    await executor.execute(command);
    expect(document.parentOf('r1')).toBe(container);
    expect(history.undoCount()).toBe(1);

    await command.undo();
    expect(document.parentOf('r1')).toBeUndefined();
    await command.redo();
    expect(document.parentOf('r1')).toBe(container);

    const noOp = new AddToCommand(document, 'container', 'r1');
    await executor.execute(noOp);
    expect(noOp.undoHandler).toBeUndefined();
    expect(history.undoCount()).toBe(1);
  });

  it('[CHANGE-09] restores front and back sibling order', async () => {
    const document = new SvgDocument(100, 100);
    document.createShape(new RectSpec('r1', 0, 0, 1, 1));
    document.createShape(new RectSpec('r2', 0, 0, 1, 1));
    document.createShape(new RectSpec('r3', 0, 0, 1, 1));
    const order = (): readonly string[] =>
      [...document.children].map((shape) => shape.id);

    const front = new FrontShapeCommand(document, 'r1');
    await front.execute();
    expect(order()).toEqual(['r2', 'r3', 'r1']);
    await front.undo();
    expect(order()).toEqual(['r1', 'r2', 'r3']);
    await front.redo();
    expect(order()).toEqual(['r2', 'r3', 'r1']);

    const back = new BackShapeCommand(document, 'r1');
    await back.execute();
    expect(order()).toEqual(['r1', 'r2', 'r3']);
    await back.undo();
    expect(order()).toEqual(['r2', 'r3', 'r1']);
    await back.redo();
    expect(order()).toEqual(['r1', 'r2', 'r3']);
  });
});
