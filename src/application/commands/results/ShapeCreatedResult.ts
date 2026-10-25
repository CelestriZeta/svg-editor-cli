import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';

export class ShapeCreatedResult extends CommandResult {
  public override readonly succeeded = true;

  public constructor(
    private readonly createdType: string,
    private readonly createdId: string,
    private readonly parentContainerId: string | undefined
  ) {
    super();
  }

  public get shapeType(): string {
    return this.createdType;
  }

  public get shapeId(): string {
    return this.createdId;
  }

  public get parentId(): string | undefined {
    return this.parentContainerId;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeCreated(this);
  }
}
