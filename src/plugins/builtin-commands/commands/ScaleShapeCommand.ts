import type { SvgDocument } from '../../../domain/document/SvgDocument.js';
import { DomainError } from '../../../domain/DomainError.js';
import type { GeometryChangeSet } from '../../../domain/shapes/GeometryChangeSet.js';
import type { DocumentQuery } from '../../../application/queries/DocumentQuery.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { EditChangeSetCommand } from '../../../application/commands/EditChangeSetCommand.js';
import type { EditDirection } from '../../../application/commands/results/EditDirection.js';
import { ShapeScaledResult } from '../../../application/commands/results/ShapeScaledResult.js';

export class ScaleShapeCommand extends EditChangeSetCommand {
  #shapeType: string | undefined;

  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string,
    private readonly factor: number,
    private readonly viewVisitor: DocumentQuery
  ) {
    super();
  }

  protected prepareChange(): GeometryChangeSet {
    const shape = this.document.requireShape(this.shapeId);
    this.#shapeType = shape.type;
    return shape.prepareScale(this.factor);
  }

  protected createResult(
    direction: EditDirection,
    changed: boolean
  ): CommandResult {
    const shape = this.document.requireShape(this.shapeId);
    return new ShapeScaledResult(
      this.requireShapeType(),
      this.shapeId,
      this.factor,
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
