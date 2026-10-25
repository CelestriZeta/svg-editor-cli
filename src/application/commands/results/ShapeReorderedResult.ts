import type { ReorderDirection } from '../contracts/ReorderDirection.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import { EditDirection } from './EditDirection.js';
import { StructureChangedResult } from './StructureChangedResult.js';

export class ShapeReorderedResult extends StructureChangedResult {
  public constructor(
    shapeType: string,
    shapeId: string,
    private readonly reorderDirection: ReorderDirection,
    changed: boolean,
    direction: EditDirection = EditDirection.Applied
  ) {
    super(shapeType, shapeId, changed, direction);
  }

  public get direction(): ReorderDirection {
    return this.reorderDirection;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeReordered(this);
  }
}
