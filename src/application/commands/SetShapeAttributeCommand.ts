import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ShapeAttributeChangeSet } from '../../domain/shapes/ShapeAttributeChangeSet.js';
import type { ShapeAttributeUpdate } from '../../domain/shapes/ShapeAttributeUpdate.js';
import { ShapeAttributeValueKind } from '../../domain/shapes/ShapeAttributeValueKind.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { EditChangeSetCommand } from './EditChangeSetCommand.js';
import type { EditDirection } from './results/EditDirection.js';
import { ShapeAttributeSnapshot } from './results/ShapeAttributeSnapshot.js';
import { ShapeAttributeSetResult } from './results/ShapeAttributeSetResult.js';

export class SetShapeAttributeCommand extends EditChangeSetCommand {
  readonly #shapeType: string;

  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string,
    private readonly update: ShapeAttributeUpdate
  ) {
    super();
    this.#shapeType = document.requireShape(shapeId).type;
  }

  protected prepareChange(): ShapeAttributeChangeSet {
    const shape = this.document.requireShape(this.shapeId);
    return shape.prepareSet(this.update);
  }

  protected createResult(direction: EditDirection): CommandResult {
    const shape = this.document.requireShape(this.shapeId);
    const value = shape.attributeValue(this.update.name);
    return new ShapeAttributeSetResult(
      this.#shapeType,
      this.shapeId,
      this.update.name,
      this.snapshot(value),
      direction
    );
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
