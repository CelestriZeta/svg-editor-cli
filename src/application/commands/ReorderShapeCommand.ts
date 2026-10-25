import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { CompositeChangeSet } from '../../domain/CompositeChangeSet.js';
import type { ReorderDirection } from './contracts/ReorderDirection.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { EditChangeSetCommand } from './EditChangeSetCommand.js';
import type { EditDirection } from './results/EditDirection.js';
import { ShapeReorderedResult } from './results/ShapeReorderedResult.js';

export abstract class ReorderShapeCommand extends EditChangeSetCommand {
  protected constructor(
    protected readonly document: SvgDocument,
    protected readonly shapeId: string
  ) {
    super();
  }

  protected abstract get direction(): ReorderDirection;

  protected abstract override prepareChange(): CompositeChangeSet;

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
