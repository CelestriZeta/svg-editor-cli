import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ShapeTreeChangeSet } from '../../domain/shapes/ShapeTreeChangeSet.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { TreeEditCommand } from './TreeEditCommand.js';
import { ShapeMovedIntoContainerResult } from './results/ShapeMovedIntoContainerResult.js';

export class AddToCommand extends TreeEditCommand {
  public constructor(
    document: SvgDocument,
    private readonly containerId: string,
    private readonly shapeId: string
  ) {
    super(document);
  }

  protected prepareChange(): ShapeTreeChangeSet {
    return this.document.prepareAddTo(this.containerId, this.shapeId);
  }

  protected createResult(changed: boolean): CommandResult {
    const shape = this.document.requireShape(this.shapeId);
    return new ShapeMovedIntoContainerResult(
      shape.type,
      shape.id,
      this.containerId,
      changed
    );
  }
}
