import type { SvgDocument } from '../../../domain/document/SvgDocument.js';
import type { CompositeChangeSet } from '../../../domain/CompositeChangeSet.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { EditChangeSetCommand } from '../../../application/commands/EditChangeSetCommand.js';
import type { EditDirection } from '../../../application/commands/results/EditDirection.js';
import { ShapeMovedIntoContainerResult } from '../../../application/commands/results/ShapeMovedIntoContainerResult.js';

export class AddToCommand extends EditChangeSetCommand {
  public constructor(
    private readonly document: SvgDocument,
    private readonly containerId: string,
    private readonly shapeId: string
  ) {
    super();
  }

  protected prepareChange(): CompositeChangeSet {
    return this.document.prepareAddTo(this.containerId, this.shapeId);
  }

  protected createResult(
    direction: EditDirection,
    changed: boolean
  ): CommandResult {
    const shape = this.document.requireShape(this.shapeId);
    return new ShapeMovedIntoContainerResult(
      shape.type,
      shape.id,
      this.containerId,
      changed,
      direction
    );
  }
}
