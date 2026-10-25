import { Command } from '../../src/application/commands/contracts/Command.js';
import { CommandCategory } from '../../src/application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../src/application/commands/contracts/CommandResult.js';

export class ThrowingCommand extends Command {
  public constructor(private readonly detail: string) {
    super(CommandCategory.Query);
  }

  public async execute(): Promise<CommandResult> {
    throw new Error(this.detail);
  }
}
