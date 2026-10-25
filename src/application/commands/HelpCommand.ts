import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { HelpResult } from './results/HelpResult.js';

export class HelpCommand extends Command {
  public constructor(private readonly syntaxes: readonly string[]) {
    super(CommandCategory.Query);
  }

  public async execute(): Promise<CommandResult> {
    return new HelpResult(this.syntaxes);
  }
}
