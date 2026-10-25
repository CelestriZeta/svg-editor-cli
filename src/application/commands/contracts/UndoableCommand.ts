import { CommandCategory } from './CommandCategory.js';
import { Command } from './Command.js';
import type { CommandResult } from './CommandResult.js';

export abstract class UndoableCommand extends Command {
  protected constructor() {
    super(CommandCategory.Edit);
  }

  public override get undoHandler(): UndoableCommand | undefined {
    return this;
  }

  public abstract undo(): Promise<CommandResult>;

  public abstract redo(): Promise<CommandResult>;
}
