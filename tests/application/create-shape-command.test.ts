import { describe, expect, it } from 'vitest';

import { CreateShapeCommand } from '../../src/application/commands/CreateShapeCommand.js';
import { ShapeCreatedResult } from '../../src/application/commands/results/ShapeCreatedResult.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Group } from '../../src/domain/shapes/Group.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';

describe('CreateShapeCommand', () => {
  it('[CHANGE-01] supports the undoable command contract', async () => {
    const document = new SvgDocument(800, 600);
    const parent = document.createShape(new GroupSpec('g1')) as Group;
    const command = new CreateShapeCommand(
      document,
      new RectSpec('r1', 10, 20, 100, 50),
      parent
    );

    const result = await command.execute();

    expect(result).toBeInstanceOf(ShapeCreatedResult);
    expect((result as ShapeCreatedResult).parentId).toBe('g1');
    expect(document.elementCount).toBe(2);
    expect(document.parentOf('r1')).toBe(parent);
    const firstShape = document.requireShape('r1');

    await command.undo();
    expect(document.elementCount).toBe(1);
    expect(document.findShape('r1')).toBeUndefined();

    await command.redo();
    expect(document.elementCount).toBe(2);
    expect(document.parentOf('r1')).toBe(parent);
    expect(document.requireShape('r1')).toBe(firstShape);
  });
});
