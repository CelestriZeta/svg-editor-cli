import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';

export class ShapeCreatedResult extends CommandResult {
  public override readonly succeeded = true;

  public constructor(
    private readonly createdType: string,
    private readonly createdId: string
  ) {
    super();
  }

  public get shapeType(): string {
    return this.createdType;
  }

  public get shapeId(): string {
    return this.createdId;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeCreated(this);
  }
}
