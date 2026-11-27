import type { DocumentOperations } from '../../../application/ports/DocumentOperations.js';
import { Command } from '../../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { CanvasResult } from '../../../application/commands/results/CanvasResult.js';
import { CommandExecutionGuard } from '../../../application/commands/support/CommandExecutionGuard.js';

export class ShowCanvasCommand extends Command {
  public constructor(private readonly documents: DocumentOperations) {
    super(CommandCategory.Query);
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const size = this.documents.canvasSize();
      return new CanvasResult(size.width, size.height);
    });
  }
}
