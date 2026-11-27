import { DomainError } from '../domain/DomainError.js';
import { Command } from './commands/contracts/Command.js';
import { InvalidCommand } from './commands/InvalidCommand.js';
import type { CommandCatalog } from './extensions/CommandCatalog.js';

export class CommandDispatcher {
  public constructor(private readonly commands: CommandCatalog) {}

  public create(tokens: readonly string[]): Command {
    const [name, ...args] = tokens;
    if (name === undefined) {
      return new InvalidCommand('missing command');
    }
    try {
      const contribution = this.commands.findCommand(name);
      if (contribution === undefined) {
        return new InvalidCommand(`unknown command: ${name}`);
      }
      const command = contribution.create(args);
      if (!(command instanceof Command)) {
        throw new TypeError('command contribution must create a Command instance');
      }
      return command;
    } catch (error) {
      return new InvalidCommand(
        error instanceof DomainError ? error.message : 'command failed', error
      );
    }
  }
}
