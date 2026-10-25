import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ShapeTreeChangeSet } from '../../domain/shapes/ShapeTreeChangeSet.js';
import type { CommandResult } from './contracts/CommandResult.js';
import type { EditDirection } from './results/EditDirection.js';
import { ShapeDeletedResult } from './results/ShapeDeletedResult.js';
import { TreeEditCommand } from './TreeEditCommand.js';

export class DeleteShapeCommand extends TreeEditCommand {
  readonly #shapeType: string;
  #parentId: string | undefined;

  public constructor(
    document: SvgDocument,
    private readonly shapeId: string
  ) {
    super(document);
    this.#shapeType = document.requireShape(shapeId).type;
  }

  protected prepareChange(): ShapeTreeChangeSet {
    const shape = this.document.requireShape(this.shapeId);
    this.#parentId = shape.parent?.id;
    return this.document.prepareDeleteShape(this.shapeId);
  }

  protected createResult(direction: EditDirection): CommandResult {
    return new ShapeDeletedResult(
      this.#shapeType,
      this.shapeId,
      this.#parentId,
      direction
    );
  }
}
