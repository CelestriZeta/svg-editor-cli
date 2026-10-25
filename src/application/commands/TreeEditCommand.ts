import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ShapeTreeChangeSet } from '../../domain/shapes/ShapeTreeChangeSet.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { UndoableCommand } from './contracts/UndoableCommand.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export abstract class TreeEditCommand extends UndoableCommand {
  #changeSet: ShapeTreeChangeSet | undefined;

  protected constructor(protected readonly document: SvgDocument) {
    super();
  }

  public override get undoHandler(): UndoableCommand | undefined {
    return this.#changeSet?.hasChanges === true ? this : undefined;
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const changeSet = this.prepareChange();
      changeSet.apply();
      this.#changeSet = changeSet;
      try {
        return this.createResult(changeSet.hasChanges);
      } catch (error) {
        changeSet.revert();
        this.#changeSet = undefined;
        throw error;
      }
    });
  }

  public async undo(): Promise<void> {
    this.#changeSet?.revert();
  }

  public async redo(): Promise<void> {
    this.#changeSet?.apply();
  }

  protected abstract prepareChange(): ShapeTreeChangeSet;

  protected abstract createResult(changed: boolean): CommandResult;
}
