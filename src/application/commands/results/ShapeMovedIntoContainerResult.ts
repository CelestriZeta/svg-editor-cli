import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import { StructureChangedResult } from './StructureChangedResult.js';

export class ShapeMovedIntoContainerResult extends StructureChangedResult {
  public constructor(
    shapeType: string,
    shapeId: string,
    private readonly targetContainerId: string,
    changed: boolean
  ) {
    super(shapeType, shapeId, changed);
  }

  public get containerId(): string {
    return this.targetContainerId;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeMovedIntoContainer(this);
  }
}
