import type { SvgDocument } from '../../../domain/document/SvgDocument.js';
import type { DocumentQuery } from '../../../application/queries/DocumentQuery.js';
import { Command } from '../../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../../application/commands/contracts/CommandResult.js';
import { ShapeDetailsResult } from '../../../application/commands/results/ShapeDetailsResult.js';
import { CommandExecutionGuard } from '../../../application/commands/support/CommandExecutionGuard.js';

export class ShowCommand extends Command {
  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string,
    private readonly viewVisitor: DocumentQuery
  ) {
    super(CommandCategory.Query);
  }

  public async execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => {
      const shape = this.document.requireShape(this.shapeId);
      return new ShapeDetailsResult(this.viewVisitor.inspect(shape));
    });
  }
}
