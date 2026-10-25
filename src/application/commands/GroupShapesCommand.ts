import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ShapeTreeChangeSet } from '../../domain/shapes/ShapeTreeChangeSet.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { GroupCreatedResult } from './results/GroupCreatedResult.js';
import { TreeEditCommand } from './TreeEditCommand.js';

export class GroupShapesCommand extends TreeEditCommand {
  public constructor(
    document: SvgDocument,
    private readonly groupId: string,
    private readonly targetIds: readonly string[]
  ) {
    super(document);
  }

  protected prepareChange(): ShapeTreeChangeSet {
    return this.document.prepareGroup(this.groupId, this.targetIds);
  }

  protected createResult(changed: boolean): CommandResult {
    return new GroupCreatedResult(this.groupId, this.targetIds.length);
  }
}
