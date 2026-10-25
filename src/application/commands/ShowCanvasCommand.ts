import type { DocumentService } from '../DocumentService.js';
import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { CanvasResult } from './results/CanvasResult.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export class ShowCanvasCommand extends Command {
  public constructor(private readonly documents: DocumentService) {
    super(CommandCategory.Query);
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const size = this.documents.canvasSize();
      return new CanvasResult(size.width, size.height);
    });
  }
}
