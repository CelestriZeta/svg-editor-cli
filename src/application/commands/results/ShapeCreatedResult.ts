import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import { EditDirection } from './EditDirection.js';

export class ShapeCreatedResult extends CommandResult {
  public override readonly succeeded = true;

  public constructor(
    private readonly createdType: string,
    private readonly createdId: string,
    private readonly parentContainerId: string | undefined,
    private readonly editDirectionValue: EditDirection = EditDirection.Applied
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

  public get editDirection(): EditDirection {
    return this.editDirectionValue;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeCreated(this);
  }
}
