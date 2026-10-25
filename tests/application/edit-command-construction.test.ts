import { describe, expect, it } from 'vitest';

import { CommandExecutor } from '../../src/application/CommandExecutor.js';
import { CommandHistory } from '../../src/application/CommandHistory.js';
import { DeleteShapeCommand } from '../../src/application/commands/DeleteShapeCommand.js';
import { MoveShapeCommand } from '../../src/application/commands/MoveShapeCommand.js';
import { ScaleShapeCommand } from '../../src/application/commands/ScaleShapeCommand.js';
import { SetShapeAttributeCommand } from '../../src/application/commands/SetShapeAttributeCommand.js';
import { ErrorResult } from '../../src/application/commands/results/ErrorResult.js';
import { ShapeMovedResult } from '../../src/application/commands/results/ShapeMovedResult.js';
import { ShapeScaledResult } from '../../src/application/commands/results/ShapeScaledResult.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';

describe('edit command construction', () => {
  it('[EXEC-02, TARGET-01] validates mutable targets during execution', async () => {
    const document = new SvgDocument(100, 100);
    const history = new CommandHistory();
    const executor = new CommandExecutor(history);
    const commands = [
      new DeleteShapeCommand(document, 'missing'),
      new MoveShapeCommand(document, 'missing', 1, 2),
      new ScaleShapeCommand(document, 'missing', 2),
      new SetShapeAttributeCommand(
        document,
        'missing',
        ShapeAttributeUpdate.text('fill', 'red')
      )
    ];

    for (const command of commands) {
      const result = await executor.execute(command);
      expect(result).toBeInstanceOf(ErrorResult);
      expect((result as ErrorResult).text).toBe(
        'no such shape: missing'
      );
    }
    expect(history.undoCount()).toBe(0);
  });

  it('[CHANGE-03/04, HIST-01] reports no change for identity edits', async () => {
    const document = new SvgDocument(100, 100);
    const history = new CommandHistory();
    const executor = new CommandExecutor(history);
    document.createShape(new RectSpec('r1', 1, 2, 3, 4));

    const moved = await executor.execute(
      new MoveShapeCommand(document, 'r1', 0, 0)
    );
    const scaled = await executor.execute(
      new ScaleShapeCommand(document, 'r1', 1)
    );

    expect(moved).toBeInstanceOf(ShapeMovedResult);
    expect((moved as ShapeMovedResult).changed).toBe(false);
    expect(scaled).toBeInstanceOf(ShapeScaledResult);
    expect((scaled as ShapeScaledResult).changed).toBe(false);
    expect(history.undoCount()).toBe(0);
  });
});
