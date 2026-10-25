import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { ErrorResult } from './results/ErrorResult.js';

export class InvalidCommand extends Command {
  public constructor(private readonly message: string) {
    super(CommandCategory.Query);
  }

  public async execute(): Promise<CommandResult> {
    return new ErrorResult(this.message);
  }
}
