import { CommandCategory } from './CommandCategory.js';
import type { CommandResult } from './CommandResult.js';
import type { UndoableCommand } from './UndoableCommand.js';

export abstract class Command {
  protected constructor(private readonly commandCategory: CommandCategory) {}

  public get category(): CommandCategory {
    return this.commandCategory;
  }

  public get undoHandler(): UndoableCommand | undefined {
    return undefined;
  }

  public abstract execute(): Promise<CommandResult>;
}
