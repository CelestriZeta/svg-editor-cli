import type { SvgDocument } from '../../../domain/document/SvgDocument.js';
import { DomainError } from '../../../domain/DomainError.js';
import type { ChangeSet } from '../../../domain/ChangeSet.js';
import type { PreparedAttributeEdit } from '../../../application/extensions/PreparedAttributeEdit.js';
import type { ShapeAttributeUpdate } from '../../../domain/shapes/ShapeAttributeUpdate.js';
import { ShapeAttributeValueKind } from '../../../domain/shapes/ShapeAttributeValueKind.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { EditChangeSetCommand } from '../../../application/commands/EditChangeSetCommand.js';
import type { EditDirection } from '../../../application/commands/results/EditDirection.js';
import { ShapeAttributeSnapshot } from '../../../application/commands/results/ShapeAttributeSnapshot.js';
import { ShapeAttributeSetResult } from '../../../application/commands/results/ShapeAttributeSetResult.js';

export class SetShapeAttributeCommand extends EditChangeSetCommand {
  #prepared: PreparedAttributeEdit | undefined;
  #shapeType: string | undefined;

  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string,
    private readonly update: ShapeAttributeUpdate,
    private readonly prepareEdit?: () => PreparedAttributeEdit
  ) {
    super();
  }

  protected prepareChange(): ChangeSet {
    const shape = this.document.requireShape(this.shapeId);
    this.#shapeType = shape.type;
    this.#prepared = this.prepareEdit?.();
    return this.#prepared?.changeSet ?? shape.prepareSet(this.update);
  }

  protected createResult(direction: EditDirection): CommandResult {
    const shape = this.document.requireShape(this.shapeId);
    const value = this.#prepared?.readValue() ?? shape.attributeValue(this.update.name);
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
