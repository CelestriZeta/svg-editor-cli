import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import type { ReorderDirection } from './ReorderDirection.js';
import { StructureChangedResult } from './StructureChangedResult.js';

export class ShapeReorderedResult extends StructureChangedResult {
  public constructor(
    shapeType: string,
    shapeId: string,
    private readonly reorderDirection: ReorderDirection,
    changed: boolean
  ) {
    super(shapeType, shapeId, changed);
  }

  public get direction(): ReorderDirection {
    return this.reorderDirection;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeReordered(this);
  }
}
