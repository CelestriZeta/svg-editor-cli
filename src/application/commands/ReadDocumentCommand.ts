import type { DocumentService } from '../DocumentService.js';
import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { AssignedShapeId } from './results/AssignedShapeId.js';
import { DocumentReadResult } from './results/DocumentReadResult.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export class ReadDocumentCommand extends Command {
  public constructor(
    private readonly documents: DocumentService,
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
