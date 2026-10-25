import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ContainerShape } from '../../domain/shapes/ContainerShape.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { ShapeTreeChangeSet } from '../../domain/shapes/ShapeTreeChangeSet.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { UndoableCommand } from './contracts/UndoableCommand.js';
import { ShapeCreatedResult } from './results/ShapeCreatedResult.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export class CreateShapeCommand extends UndoableCommand {
  #changeSet: ShapeTreeChangeSet | undefined;

  public constructor(
    private readonly document: SvgDocument,
    private readonly spec: ShapeSpec,
    private readonly parent: ContainerShape | undefined = undefined
  ) {
    super();
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const shape = this.createShape();
      try {
        return new ShapeCreatedResult(shape.type, shape.id, this.parent?.id);
      } catch (error) {
        this.#changeSet?.revert();
        this.#changeSet = undefined;
        throw error;
      }
    });
  }

  public async undo(): Promise<void> {
    if (this.#changeSet === undefined) {
      return;
    }

    this.#changeSet.revert();
  }

  public async redo(): Promise<void> {
    this.#changeSet?.apply();
  }

  private createShape(): Shape {
    const changeSet = this.document.prepareCreateShape(this.spec, this.parent);
    changeSet.apply();
    this.#changeSet = changeSet;
    return this.document.requireShape(this.spec.id);
  }
}
