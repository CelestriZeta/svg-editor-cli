import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ShapeTreeChangeSet } from '../../domain/shapes/ShapeTreeChangeSet.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { TreeEditCommand } from './TreeEditCommand.js';
import { UngroupedResult } from './results/UngroupedResult.js';

export class UngroupShapeCommand extends TreeEditCommand {
  #parentId: string | undefined;
  #childCount = 0;

  public constructor(
    document: SvgDocument,
    private readonly groupId: string
  ) {
    super(document);
  }

  protected prepareChange(): ShapeTreeChangeSet {
    const group = this.document.requireContainer(this.groupId);
    this.#parentId = group.parent?.id;
    this.#childCount = [...group.children].length;
    return this.document.prepareUngroup(this.groupId);
  }

  protected createResult(changed: boolean): CommandResult {
    return new UngroupedResult(this.groupId, this.#parentId, this.#childCount);
  }
}
