import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ContainerShape } from '../../domain/shapes/ContainerShape.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { ShapeTreeChangeSet } from '../../domain/shapes/ShapeTreeChangeSet.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { EditChangeSetCommand } from './EditChangeSetCommand.js';
import { EditDirection } from './results/EditDirection.js';
import { ShapeCreatedResult } from './results/ShapeCreatedResult.js';

export class CreateShapeCommand extends EditChangeSetCommand {
  public constructor(
    private readonly document: SvgDocument,
    private readonly spec: ShapeSpec,
    private readonly parent: ContainerShape | undefined = undefined
  ) {
    super();
  }

  protected prepareChange(): ShapeTreeChangeSet {
    return this.document.prepareCreateShape(this.spec, this.parent);
  }

  protected override createResult(direction: EditDirection): CommandResult {
    return new ShapeCreatedResult(
      this.spec.type,
      this.spec.id,
      this.parent?.id,
      direction
    );
  }
}
