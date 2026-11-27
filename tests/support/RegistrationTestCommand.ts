import type { Command } from '../../src/application/commands/contracts/Command.js';
import { HelpCommand } from '../../src/plugins/builtin-commands/commands/HelpCommand.js';
import type { CommandContribution } from '../../src/application/extensions/CommandContribution.js';

export class RegistrationTestCommand implements CommandContribution {
  public constructor(public readonly name = 'probe') {}

  public get syntaxes(): readonly string[] {
    return [this.name];
  }

  public create(args: readonly string[]): Command {
    return new HelpCommand(args);
  }
}
