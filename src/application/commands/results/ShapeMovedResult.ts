import type { ShapeAnchor } from '../../queries/ShapeAnchor.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import { EditDirection } from './EditDirection.js';
import { StructureChangedResult } from './StructureChangedResult.js';

export class ShapeMovedResult extends StructureChangedResult {
  public constructor(
    shapeType: string,
    shapeId: string,
    private readonly deltaX: number,
    private readonly deltaY: number,
    private readonly position: ShapeAnchor | undefined,
    changed: boolean,
    direction: EditDirection = EditDirection.Applied
  ) {
    super(shapeType, shapeId, changed, direction);
  }

  public get dx(): number {
    return this.deltaX;
  }

  public get dy(): number {
    return this.deltaY;
  }

  public get anchor(): ShapeAnchor | undefined {
    return this.position;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeMoved(this);
  }
}
