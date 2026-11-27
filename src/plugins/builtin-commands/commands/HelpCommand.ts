import { Command } from '../../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { HelpResult } from '../../../application/commands/results/HelpResult.js';

export class HelpCommand extends Command {
  public constructor(private readonly syntaxes: readonly string[]) {
    super(CommandCategory.Query);
  }

  public async execute(): Promise<CommandResult> {
    return new HelpResult(this.syntaxes);
  }
}
