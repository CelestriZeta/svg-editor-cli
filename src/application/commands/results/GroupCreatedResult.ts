import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import { EditDirection } from './EditDirection.js';
import { StructureChangedResult } from './StructureChangedResult.js';

export class GroupCreatedResult extends StructureChangedResult {
  public constructor(
    groupId: string,
    private readonly affectedChildCount: number,
    direction: EditDirection = EditDirection.Applied
  ) {
    super('g', groupId, true, direction);
  }

  public get childCount(): number {
    return this.affectedChildCount;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitGroupCreated(this);
  }
}
