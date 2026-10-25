import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import { DomainError } from '../../domain/DomainError.js';
import type { CompositeChangeSet } from '../../domain/CompositeChangeSet.js';
import type { ShapeAttributeUpdate } from '../../domain/shapes/ShapeAttributeUpdate.js';
import { ShapeAttributeValueKind } from '../../domain/shapes/ShapeAttributeValueKind.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { EditChangeSetCommand } from './EditChangeSetCommand.js';
import type { EditDirection } from './results/EditDirection.js';
import { ShapeAttributeSnapshot } from './results/ShapeAttributeSnapshot.js';
import { ShapeAttributeSetResult } from './results/ShapeAttributeSetResult.js';

export class SetShapeAttributeCommand extends EditChangeSetCommand {
  #shapeType: string | undefined;

  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string,
    private readonly update: ShapeAttributeUpdate
  ) {
    super();
  }

  protected prepareChange(): CompositeChangeSet {
    const shape = this.document.requireShape(this.shapeId);
    this.#shapeType = shape.type;
    return shape.prepareSet(this.update);
  }

  protected createResult(direction: EditDirection): CommandResult {
    const shape = this.document.requireShape(this.shapeId);
    const value = shape.attributeValue(this.update.name);
    return new ShapeAttributeSetResult(
      this.requireShapeType(),
      this.shapeId,
      this.update.name,
      this.snapshot(value),
      direction
    );
  }

  private requireShapeType(): string {
    if (this.#shapeType === undefined) {
      throw new DomainError('command has not been prepared');
    }
    return this.#shapeType;
  }

  private snapshot(value: {
    readonly isAbsent: boolean;
    readonly kind: ShapeAttributeValueKind;
    readonly numericValue: number;
    readonly textValue: string;
  }): ShapeAttributeSnapshot {
    if (value.isAbsent) {
      return ShapeAttributeSnapshot.absent();
    }
    return value.kind === ShapeAttributeValueKind.Number
      ? ShapeAttributeSnapshot.number(value.numericValue)
      : ShapeAttributeSnapshot.text(value.textValue);
  }
}
