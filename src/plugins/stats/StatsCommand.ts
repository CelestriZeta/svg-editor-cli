import { Command } from '../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../application/commands/contracts/CommandResult.js';
import { PresentedCommandResult } from '../../application/commands/results/PresentedCommandResult.js';
import { CommandExecutionGuard } from '../../application/commands/support/CommandExecutionGuard.js';
import type { ActiveDocument } from '../../application/ports/ActiveDocument.js';
import type { DocumentQuery } from '../../application/queries/DocumentQuery.js';
import { StatsPresenter } from './StatsPresenter.js';
export class StatsCommand extends Command {
  public constructor(private readonly documents: ActiveDocument, private readonly query: DocumentQuery) { super(CommandCategory.Query); }
  public execute(): Promise<CommandResult> {
    return CommandExecutionGuard.run(async () => new PresentedCommandResult(this.query.visit(this.documents.requireDocument()), new StatsPresenter()));
  }
}
