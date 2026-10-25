import { CommandCategory } from './commands/contracts/CommandCategory.js';
import type { CommandHistory } from './CommandHistory.js';
import type { Command } from './commands/contracts/Command.js';
import type { CommandResult } from './commands/contracts/CommandResult.js';
import { ErrorResult } from './commands/results/ErrorResult.js';

export class CommandExecutor {
  #tail: Promise<void> = Promise.resolve();

  public constructor(private readonly history: CommandHistory) {}

  public execute(command: Command): Promise<CommandResult> {
    const operation = this.#tail.then(() => this.run(command));
    // 队列尾部吸收失败，让后续命令继续串行执行；当前调用仍收到原操作的结果。
    this.#tail = operation.then(
      () => undefined,
      () => undefined
    );
    return operation;
  }

  private async run(command: Command): Promise<CommandResult> {
    let result: CommandResult;
    try {
      result = await command.execute();
    } catch (error) {
      return new ErrorResult('command failed', error);
    }

    if (!result.succeeded) {
      return result;
    }

    const undoable = command.undoHandler;
    if (undoable !== undefined) {
      this.history.record(undoable);
      return result;
    }

    switch (command.category) {
      case CommandCategory.Document:
        this.history.establishIoBarrier();
        break;
      case CommandCategory.Edit:
      case CommandCategory.History:
      case CommandCategory.Query:
        break;
    }

    return result;
  }
}
