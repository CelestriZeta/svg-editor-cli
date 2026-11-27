import type { CommandContribution } from '../../application/extensions/CommandContribution.js';
import type { PluginServices } from '../../application/extensions/PluginServices.js';
import type { Command } from '../../application/commands/contracts/Command.js';
import { InvalidCommand } from '../../application/commands/InvalidCommand.js';
import { StatsCommand } from './StatsCommand.js';
export class StatsContribution implements CommandContribution {
  public readonly name = 'stats';
  public readonly syntaxes = Object.freeze(['stats']);
  public constructor(private readonly services: Pick<PluginServices, 'documents' | 'query'>) {}
  public create(args: readonly string[]): Command {
    return args.length === 0 ? new StatsCommand(this.services.documents, this.services.query) : new InvalidCommand('stats takes no arguments');
  }
}
