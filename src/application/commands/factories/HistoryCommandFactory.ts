import type { CommandHistory } from '../../CommandHistory.js';
import type { EditorSession } from '../../EditorSession.js';
import { InvalidCommand } from '../InvalidCommand.js';
import { RedoCommand } from '../RedoCommand.js';
import { UndoCommand } from '../UndoCommand.js';
import type { Command } from '../contracts/Command.js';
import { CommandDocumentBinding } from '../support/CommandDocumentBinding.js';

export class HistoryCommandFactory {
  public constructor(
    private readonly session: EditorSession,
    private readonly history: CommandHistory
  ) {}

  public createUndo(args: readonly string[]): Command {
    if (args.length !== 0) {
      return new InvalidCommand('undo takes no arguments');
    }
    return CommandDocumentBinding.withDocument(
      this.session,
      () => new UndoCommand(this.history)
    );
  }

  public createRedo(args: readonly string[]): Command {
    if (args.length !== 0) {
      return new InvalidCommand('redo takes no arguments');
    }
    return CommandDocumentBinding.withDocument(
      this.session,
      () => new RedoCommand(this.history)
    );
  }
}
