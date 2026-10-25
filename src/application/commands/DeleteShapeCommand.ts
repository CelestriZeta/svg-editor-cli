import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import { DomainError } from '../../domain/DomainError.js';
import type { CompositeChangeSet } from '../../domain/CompositeChangeSet.js';
import type { CommandResult } from './contracts/CommandResult.js';
import type { EditDirection } from './results/EditDirection.js';
import { ShapeDeletedResult } from './results/ShapeDeletedResult.js';
import { EditChangeSetCommand } from './EditChangeSetCommand.js';

export class DeleteShapeCommand extends EditChangeSetCommand {
  #shapeType: string | undefined;
  #parentId: string | undefined;

  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string
  ) {
    super();
  }

  protected prepareChange(): CompositeChangeSet {
    const shape = this.document.requireShape(this.shapeId);
    this.#shapeType = shape.type;
    this.#parentId = shape.parent?.id;
    return this.document.prepareDeleteShape(this.shapeId);
  }

  protected createResult(direction: EditDirection): CommandResult {
    return new ShapeDeletedResult(
      this.requireShapeType(),
      this.shapeId,
      this.#parentId,
      direction
    );
  }

  private requireShapeType(): string {
    if (this.#shapeType === undefined) {
      throw new DomainError('command has not been prepared');
    }
    return this.#shapeType;
  }
}
