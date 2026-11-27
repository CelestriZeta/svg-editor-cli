import { Command } from '../../src/application/commands/contracts/Command.js';
import { CommandCategory } from '../../src/application/commands/contracts/CommandCategory.js';
import type { CommandPresenter } from '../../src/application/commands/contracts/CommandPresenter.js';
import { PresentedCommandResult } from '../../src/application/commands/results/PresentedCommandResult.js';

export class ProbeCommand extends Command {
  public constructor(private readonly presenter: CommandPresenter<number>) {
    super(CommandCategory.Query);
  }

  public async execute(): Promise<PresentedCommandResult<number>> {
    return new PresentedCommandResult(7, this.presenter);
  }
}
