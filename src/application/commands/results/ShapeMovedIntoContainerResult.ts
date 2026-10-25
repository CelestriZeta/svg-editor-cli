import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import { EditDirection } from './EditDirection.js';
import { StructureChangedResult } from './StructureChangedResult.js';

export class ShapeMovedIntoContainerResult extends StructureChangedResult {
  public constructor(
    shapeType: string,
    shapeId: string,
    private readonly targetContainerId: string,
    changed: boolean,
    direction: EditDirection = EditDirection.Applied
  ) {
    super(shapeType, shapeId, changed, direction);
  }

  public get containerId(): string {
    return this.targetContainerId;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeMovedIntoContainer(this);
  }
}
