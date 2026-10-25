import type { ChangeSet } from '../../domain/ChangeSet.js';
import { DomainError } from '../../domain/DomainError.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { UndoableCommand } from './contracts/UndoableCommand.js';
import { EditDirection } from './results/EditDirection.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export abstract class EditChangeSetCommand extends UndoableCommand {
  #changeSet: ChangeSet | undefined;

  public override get undoHandler(): UndoableCommand | undefined {
    // 成功但没有状态变化的编辑不入历史，也不清空已有 redo。
    return this.#changeSet?.hasChanges === true ? this : undefined;
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const changeSet = this.prepareChange();
      changeSet.apply();
      this.#changeSet = changeSet;
      // 结果构造也是命令的一部分；若失败，必须撤回已提交的变更。
      try {
        return this.createResult(EditDirection.Applied, changeSet.hasChanges);
      } catch (error) {
        this.#changeSet = undefined;
        changeSet.revert();
        throw error;
      }
    });
  }

  public async undo(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const changeSet = this.requireChangeSet();
      changeSet.revert();
      try {
        return this.createResult(EditDirection.Undone, changeSet.hasChanges);
      } catch (error) {
        changeSet.apply();
        throw error;
      }
    });
  }

  public async redo(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const changeSet = this.requireChangeSet();
      changeSet.apply();
      try {
        return this.createResult(EditDirection.Redone, changeSet.hasChanges);
      } catch (error) {
        changeSet.revert();
        throw error;
      }
    });
  }

  protected abstract prepareChange(): ChangeSet;

  protected abstract createResult(
    direction: EditDirection,
    changed: boolean
  ): CommandResult;

  private requireChangeSet(): ChangeSet {
    if (this.#changeSet === undefined) {
      throw new DomainError('command has not been executed');
    }
    return this.#changeSet;
  }
}
