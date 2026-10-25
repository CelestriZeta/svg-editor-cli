import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { GeometryChangeSet } from '../../domain/shapes/GeometryChangeSet.js';
import { ShapeAnchorProjector } from '../queries/ShapeAnchorProjector.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { EditChangeSetCommand } from './EditChangeSetCommand.js';
import type { EditDirection } from './results/EditDirection.js';
import { ShapeScaledResult } from './results/ShapeScaledResult.js';

export class ScaleShapeCommand extends EditChangeSetCommand {
  readonly #shapeType: string;

  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string,
    private readonly factor: number,
    private readonly anchorProjector = new ShapeAnchorProjector()
  ) {
    super();
    this.#shapeType = document.requireShape(shapeId).type;
  }

  protected prepareChange(): GeometryChangeSet {
    const shape = this.document.requireShape(this.shapeId);
    return shape.prepareScale(this.factor);
  }

  protected createResult(direction: EditDirection): CommandResult {
    const shape = this.document.requireShape(this.shapeId);
    return new ShapeScaledResult(
      this.#shapeType,
      this.shapeId,
      this.factor,
      shape.accept(this.anchorProjector),
      direction
    );
  }
}
