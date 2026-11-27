import type { DocumentOperations } from '../../../application/ports/DocumentOperations.js';
import { Command } from '../../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { AssignedShapeId } from '../../../application/commands/results/AssignedShapeId.js';
import { DocumentReadResult } from '../../../application/commands/results/DocumentReadResult.js';
import { CommandExecutionGuard } from '../../../application/commands/support/CommandExecutionGuard.js';

export class ReadDocumentCommand extends Command {
  public constructor(
    private readonly documents: DocumentOperations,
    private readonly path: string
  ) {
    super(CommandCategory.Document);
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const loaded = await this.documents.read(this.path);
      return new DocumentReadResult(
        this.path,
        loaded.document.elementCount,
        loaded.assignedIds.map(
          (assignment) =>
            new AssignedShapeId(assignment.tagName, assignment.id)
        )
      );
    });
  }
}
