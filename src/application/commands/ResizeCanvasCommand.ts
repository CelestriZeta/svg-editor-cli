import type { DocumentService } from '../DocumentService.js';
import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { CanvasResizedResult } from './results/CanvasResizedResult.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export class ResizeCanvasCommand extends Command {
  public constructor(
    private readonly documents: DocumentService,
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
