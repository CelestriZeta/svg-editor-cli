import type { DocumentService } from '../DocumentService.js';
import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { CanvasCreatedResult } from './results/CanvasCreatedResult.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export class InitCommand extends Command {
  public constructor(
    private readonly documents: DocumentService,
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
