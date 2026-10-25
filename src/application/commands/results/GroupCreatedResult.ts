import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import { StructureChangedResult } from './StructureChangedResult.js';

export class GroupCreatedResult extends StructureChangedResult {
  public constructor(
    groupId: string,
    private readonly affectedChildCount: number
  ) {
    super('g', groupId, true);
  }

  public get childCount(): number {
    return this.affectedChildCount;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitGroupCreated(this);
  }
}
