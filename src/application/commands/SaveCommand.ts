import type { DocumentService } from '../DocumentService.js';
import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { DocumentSavedResult } from './results/DocumentSavedResult.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export class SaveCommand extends Command {
  public constructor(
    private readonly documents: DocumentService,
    private readonly path?: string
  ) {
    super(CommandCategory.Document);
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const path = await this.documents.save(this.path);
      const count = this.documents.countElements();
      return new DocumentSavedResult(path, count);
    });
  }
}
