import { CommandCategory } from './CommandCategory.js';
import { Command } from './Command.js';

export abstract class UndoableCommand extends Command {
  protected constructor() {
    super(CommandCategory.Edit);
  }

  public override get undoHandler(): UndoableCommand {
    return this;
  }

  public abstract undo(): Promise<void>;

  public abstract redo(): Promise<void>;
}
