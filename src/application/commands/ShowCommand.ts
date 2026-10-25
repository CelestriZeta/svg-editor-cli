import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { DocumentViewVisitor } from '../queries/DocumentViewVisitor.js';
import { Command } from './contracts/Command.js';
import { CommandCategory } from './contracts/CommandCategory.js';
import type { CommandResult } from './contracts/CommandResult.js';
import { ShapeDetailsResult } from './results/ShapeDetailsResult.js';
import { CommandExecutionGuard } from './support/CommandExecutionGuard.js';

export class ShowCommand extends Command {
  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string,
    private readonly viewVisitor: DocumentViewVisitor
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
