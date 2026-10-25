import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { UndoableCommand } from './contracts/UndoableCommand.js';
import { ShapeCreatedResult } from './results/ShapeCreatedResult.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export class CreateShapeCommand extends UndoableCommand {
  #shape: Shape | undefined;

  public constructor(
    private readonly document: SvgDocument,
    private readonly spec: ShapeSpec
  ) {
    super();
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const shape = this.createShape();
      return new ShapeCreatedResult(shape.type, shape.id);
    });
  }

  public async undo(): Promise<void> {
    if (this.#shape === undefined) {
      return;
    }

    this.document.removeShape(this.#shape.id);
    this.#shape = undefined;
  }

  public async redo(): Promise<void> {
    this.createShape();
  }

  private createShape(): Shape {
    const shape = this.document.createShape(this.spec);
    this.#shape = shape;
    return shape;
  }
}
