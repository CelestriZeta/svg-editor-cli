import type { SvgDocument } from '../../../domain/document/SvgDocument.js';
import type { DocumentQuery } from '../../../application/queries/DocumentQuery.js';
import { Command } from '../../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { TreeSubtreeResult } from '../../../application/commands/results/TreeSubtreeResult.js';
import { TreeResult } from '../../../application/commands/results/TreeResult.js';
import { CommandExecutionGuard } from '../../../application/commands/support/CommandExecutionGuard.js';

export class TreeCommand extends Command {
  public constructor(
    private readonly document: SvgDocument,
    private readonly viewVisitor: DocumentQuery,
    private readonly shapeId?: string
  ) {
    super(CommandCategory.Query);
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      if (this.shapeId !== undefined) {
        const root = this.document.requireShape(this.shapeId);
        return new TreeSubtreeResult(
          this.viewVisitor.visitSubtree(root)
        );
      }

      return new TreeResult(this.viewVisitor.visit(this.document));
    });
  }
}
