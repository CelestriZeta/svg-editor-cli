import type { DocumentOperations } from '../../../application/ports/DocumentOperations.js';
import { Command } from '../../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { CanvasCreatedResult } from '../../../application/commands/results/CanvasCreatedResult.js';
import { CommandExecutionGuard } from '../../../application/commands/support/CommandExecutionGuard.js';

export class InitCommand extends Command {
  public constructor(
    private readonly documents: DocumentOperations,
    private readonly width: number,
    private readonly height: number
  ) {
    super(CommandCategory.Document);
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const document = this.documents.init(this.width, this.height);
      return new CanvasCreatedResult(document.width, document.height);
    });
  }
}
