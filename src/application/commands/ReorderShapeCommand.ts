import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ShapeTreeChangeSet } from '../../domain/shapes/ShapeTreeChangeSet.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { TreeEditCommand } from './TreeEditCommand.js';
import type { EditDirection } from './results/EditDirection.js';
import type { ReorderDirection } from './results/ReorderDirection.js';
import { ShapeReorderedResult } from './results/ShapeReorderedResult.js';

export abstract class ReorderShapeCommand extends TreeEditCommand {
  protected constructor(
    document: SvgDocument,
    private readonly shapeId: string
  ) {
    super(document);
  }

  protected abstract get direction(): ReorderDirection;

  protected prepareChange(): ShapeTreeChangeSet {
    return this.direction === 'front'
      ? this.document.prepareFront(this.shapeId)
      : this.document.prepareBack(this.shapeId);
  }

  protected createResult(
    direction: EditDirection,
    changed: boolean
  ): CommandResult {
    const shape = this.document.requireShape(this.shapeId);
    return new ShapeReorderedResult(
      shape.type,
      shape.id,
      this.direction,
      changed,
      direction
    );
  }
}
