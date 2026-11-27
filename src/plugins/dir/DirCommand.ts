import { Command } from '../../application/commands/contracts/Command.js';
import { CommandCategory } from '../../application/commands/contracts/CommandCategory.js';
import type { CommandResult } from '../../application/commands/contracts/CommandResult.js';
import { PresentedCommandResult } from '../../application/commands/results/PresentedCommandResult.js';
import { ErrorResult } from '../../application/commands/results/ErrorResult.js';
import type { DirectoryAccess } from '../../application/ports/DirectoryAccess.js';
import { DirPresenter } from './DirPresenter.js';
export class DirCommand extends Command {
  public constructor(private readonly directory: DirectoryAccess) { super(CommandCategory.Query); }
  public async execute(): Promise<CommandResult> {
    const path = this.directory.currentPath();
    try { return new PresentedCommandResult(await this.directory.entries(path), new DirPresenter()); }
    catch (error) { return new ErrorResult('cannot read directory: ' + path, error); }
  }
}
