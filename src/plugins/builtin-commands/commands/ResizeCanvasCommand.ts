import type { DocumentOperations } from '../../../application/ports/DocumentOperations.js';
import { Command } from '../../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { CanvasResizedResult } from '../../../application/commands/results/CanvasResizedResult.js';
import { CommandExecutionGuard } from '../../../application/commands/support/CommandExecutionGuard.js';

export class ResizeCanvasCommand extends Command {
  public constructor(
    private readonly documents: DocumentOperations,
    private readonly width: number,
    private readonly height: number
  ) {
    super(CommandCategory.Document);
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const size = this.documents.resizeCanvas(this.width, this.height);
      return new CanvasResizedResult(size.width, size.height);
    });
  }
}
