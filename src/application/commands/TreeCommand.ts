import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { DocumentViewVisitor } from '../queries/DocumentViewVisitor.js';
import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { TreeResult } from './results/TreeResult.js';

export class TreeCommand extends Command {
  public constructor(
    private readonly document: SvgDocument,
    private readonly viewVisitor: DocumentViewVisitor
  ) {
    super(CommandCategory.Query);
  }

  public async execute(): Promise<CommandResult> {
    return new TreeResult(this.viewVisitor.visit(this.document));
  }
}
