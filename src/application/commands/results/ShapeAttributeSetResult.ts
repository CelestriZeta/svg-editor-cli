import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import { EditDirection } from './EditDirection.js';
import type { ShapeAttributeSnapshot } from './ShapeAttributeSnapshot.js';
import { StructureChangedResult } from './StructureChangedResult.js';

export class ShapeAttributeSetResult extends StructureChangedResult {
  public constructor(
    shapeType: string,
    shapeId: string,
    private readonly attributeName: string,
    private readonly attributeSnapshot: ShapeAttributeSnapshot,
    direction: EditDirection = EditDirection.Applied
  ) {
    super(shapeType, shapeId, true, direction);
  }

  public get attribute(): string {
    return this.attributeName;
  }

  public get value(): ShapeAttributeSnapshot {
    return this.attributeSnapshot;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeAttributeSet(this);
  }
}
