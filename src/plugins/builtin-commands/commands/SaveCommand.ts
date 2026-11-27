import type { DocumentOperations } from '../../../application/ports/DocumentOperations.js';
import { Command } from '../../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { DocumentSavedResult } from '../../../application/commands/results/DocumentSavedResult.js';
import { CommandExecutionGuard } from '../../../application/commands/support/CommandExecutionGuard.js';

export class SaveCommand extends Command {
  public constructor(
    private readonly documents: DocumentOperations,
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
