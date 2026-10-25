import type { CommandHistory } from '../CommandHistory.js';
import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export class UndoCommand extends Command {
  public constructor(private readonly history: CommandHistory) {
    super(CommandCategory.History);
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(() => this.history.undo());
  }
}
