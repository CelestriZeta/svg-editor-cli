import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import { EditDirection } from './EditDirection.js';
import { StructureChangedResult } from './StructureChangedResult.js';

export class UngroupedResult extends StructureChangedResult {
  public constructor(
    groupId: string,
    private readonly targetParentId: string | undefined,
    private readonly affectedChildCount: number,
    direction: EditDirection = EditDirection.Applied
  ) {
    super('g', groupId, true, direction);
  }

  public get parentId(): string | undefined {
    return this.targetParentId;
  }

  public get childCount(): number {
    return this.affectedChildCount;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitUngrouped(this);
  }
}
