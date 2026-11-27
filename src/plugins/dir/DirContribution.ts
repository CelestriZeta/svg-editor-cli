import type { CommandContribution } from '../../application/extensions/CommandContribution.js';
import type { DirectoryAccess } from '../../application/ports/DirectoryAccess.js';
import type { Command } from '../../application/commands/contracts/Command.js';
import { InvalidCommand } from '../../application/commands/InvalidCommand.js';
import { DirCommand } from './DirCommand.js';
export class DirContribution implements CommandContribution {
  public readonly name = 'dir'; public readonly syntaxes = Object.freeze(['dir']);
  public constructor(private readonly directory: DirectoryAccess) {}
  public create(args: readonly string[]): Command {
    return args.length === 0 ? new DirCommand(this.directory) : new InvalidCommand('dir takes no arguments');
  }
}
