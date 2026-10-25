import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import { DomainError } from '../../domain/DomainError.js';
import type { GeometryChangeSet } from '../../domain/shapes/GeometryChangeSet.js';
import { DocumentViewVisitor } from '../queries/DocumentViewVisitor.js';
import type { CommandResult } from './contracts/CommandResult.js';
import type { EditDirection } from './results/EditDirection.js';
import { ShapeMovedResult } from './results/ShapeMovedResult.js';
import { EditChangeSetCommand } from './EditChangeSetCommand.js';

export class MoveShapeCommand extends EditChangeSetCommand {
  #shapeType: string | undefined;

  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string,
    private readonly dx: number,
    private readonly dy: number,
    private readonly viewVisitor = new DocumentViewVisitor()
  ) {
    super();
  }

  protected prepareChange(): GeometryChangeSet {
    const shape = this.document.requireShape(this.shapeId);
    this.#shapeType = shape.type;
    return shape.prepareMove(this.dx, this.dy);
  }

  protected createResult(
    direction: EditDirection,
    changed: boolean
  ): CommandResult {
    const shape = this.document.requireShape(this.shapeId);
    return new ShapeMovedResult(
      this.requireShapeType(),
      this.shapeId,
      this.dx,
      this.dy,
      this.viewVisitor.inspect(shape).geometry.anchor,
      changed,
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
