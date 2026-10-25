import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import { EditDirection } from './EditDirection.js';
import { StructureChangedResult } from './StructureChangedResult.js';

export class ShapeCreatedResult extends StructureChangedResult {
  public constructor(
    shapeType: string,
    shapeId: string,
    private readonly parentContainerId: string | undefined,
    direction: EditDirection = EditDirection.Applied
  ) {
    super(shapeType, shapeId, true, direction);
  }

  public get parentId(): string | undefined {
    return this.parentContainerId;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeCreated(this);
  }
}
