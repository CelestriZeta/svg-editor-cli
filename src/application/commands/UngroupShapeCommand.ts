import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { CompositeChangeSet } from '../../domain/CompositeChangeSet.js';
import type { CommandResult } from './contracts/CommandResult.js';
import type { EditDirection } from './results/EditDirection.js';
import { EditChangeSetCommand } from './EditChangeSetCommand.js';
import { UngroupedResult } from './results/UngroupedResult.js';

export class UngroupShapeCommand extends EditChangeSetCommand {
  #parentId: string | undefined;
  #childCount = 0;

  public constructor(
    private readonly document: SvgDocument,
    private readonly groupId: string
  ) {
    super();
  }

  protected prepareChange(): CompositeChangeSet {
    const group = this.document.requireContainer(this.groupId);
    this.#parentId = group.parent?.id;
    this.#childCount = [...group.children].length;
    return this.document.prepareUngroup(this.groupId);
  }

  protected createResult(direction: EditDirection): CommandResult {
    return new UngroupedResult(
      this.groupId,
      this.#parentId,
      this.#childCount,
      direction
    );
  }
}
