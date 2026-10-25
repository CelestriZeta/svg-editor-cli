import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { DocumentViewVisitor } from '../queries/DocumentViewVisitor.js';
import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { TreeSubtreeResult } from './results/TreeSubtreeResult.js';
import { TreeResult } from './results/TreeResult.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export class TreeCommand extends Command {
  public constructor(
    private readonly document: SvgDocument,
    private readonly viewVisitor: DocumentViewVisitor,
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
