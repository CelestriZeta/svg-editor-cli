import type { SvgDocument } from '../../../domain/document/SvgDocument.js';
import type { CompositeChangeSet } from '../../../domain/CompositeChangeSet.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import type { EditDirection } from '../../../application/commands/results/EditDirection.js';
import { GroupCreatedResult } from '../../../application/commands/results/GroupCreatedResult.js';
import { EditChangeSetCommand } from '../../../application/commands/EditChangeSetCommand.js';

export class GroupShapesCommand extends EditChangeSetCommand {
  public constructor(
    private readonly document: SvgDocument,
    private readonly groupId: string,
    private readonly targetIds: readonly string[]
  ) {
    super();
  }

  protected prepareChange(): CompositeChangeSet {
    return this.document.prepareGroup(this.groupId, this.targetIds);
  }

  protected createResult(direction: EditDirection): CommandResult {
    return new GroupCreatedResult(
      this.groupId,
      this.targetIds.length,
      direction
    );
  }
}
