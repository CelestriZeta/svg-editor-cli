import type { HistoryController } from '../../../application/commands/contracts/HistoryController.js';
import { Command } from '../../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { CommandExecutionGuard } from '../../../application/commands/support/CommandExecutionGuard.js';

export class RedoCommand extends Command {
  public constructor(private readonly history: HistoryController) {
    super(CommandCategory.History);
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(() => this.history.redo());
  }
}
