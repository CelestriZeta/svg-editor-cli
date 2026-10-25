import { Command } from '../../src/application/commands/contracts/Command.js';
import { CommandCategory } from '../../src/application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../src/application/commands/contracts/CommandResult.js';

export class ControlledCommand extends Command {
  public constructor(
    private readonly action: () => Promise<CommandResult>,
    category = CommandCategory.Query
  ) {
    super(category);
  }

  public execute(): Promise<CommandResult> {
    return this.action();
  }
}
