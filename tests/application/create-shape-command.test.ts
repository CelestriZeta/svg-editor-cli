import { describe, expect, it } from 'vitest';

import { CreateShapeCommand } from '../../src/application/commands/CreateShapeCommand.js';
import { ShapeCreatedResult } from '../../src/application/commands/results/ShapeCreatedResult.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';

describe('CreateShapeCommand', () => {
  it('[CHANGE-01] supports the undoable command contract', async () => {
    const document = new SvgDocument(800, 600);
    const command = new CreateShapeCommand(
      document,
      new RectSpec('r1', 10, 20, 100, 50)
    );

    const result = await command.execute();

    expect(result).toBeInstanceOf(ShapeCreatedResult);
    expect(document.elementCount).toBe(1);

    await command.undo();
    expect(document.elementCount).toBe(0);

    await command.redo();
    expect(document.elementCount).toBe(1);
  });
});
