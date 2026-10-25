import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { GeometryChangeSet } from '../../domain/shapes/GeometryChangeSet.js';
import { ShapeAnchorProjector } from '../queries/ShapeAnchorProjector.js';
import type { CommandResult } from './contracts/CommandResult.js';
import type { EditDirection } from './results/EditDirection.js';
import { ShapeMovedResult } from './results/ShapeMovedResult.js';
import { EditChangeSetCommand } from './EditChangeSetCommand.js';

export class MoveShapeCommand extends EditChangeSetCommand {
  readonly #shapeType: string;

  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string,
    private readonly dx: number,
    private readonly dy: number,
    private readonly anchorProjector = new ShapeAnchorProjector()
  ) {
    super();
    this.#shapeType = document.requireShape(shapeId).type;
  }

  protected prepareChange(): GeometryChangeSet {
    const shape = this.document.requireShape(this.shapeId);
    return shape.prepareMove(this.dx, this.dy);
  }

  protected createResult(direction: EditDirection): CommandResult {
    const shape = this.document.requireShape(this.shapeId);
    return new ShapeMovedResult(
      this.#shapeType,
      this.shapeId,
      this.dx,
      this.dy,
      shape.accept(this.anchorProjector),
      direction
    );
  }
}
