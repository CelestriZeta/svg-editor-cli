import type { EditorSession } from '../../EditorSession.js';
import type { DocumentViewVisitor } from '../../queries/DocumentViewVisitor.js';
import { InvalidCommand } from '../InvalidCommand.js';
import { TreeCommand } from '../TreeCommand.js';
import type { Command } from '../contracts/Command.js';
import { CommandDocumentBinding } from '../support/CommandDocumentBinding.js';

export class QueryCommandFactory {
  public constructor(
    private readonly session: EditorSession,
    private readonly viewVisitor: DocumentViewVisitor
  ) {}

  public createTree(args: readonly string[]): Command {
    if (args.length !== 0) {
      return new InvalidCommand('tree takes no arguments');
    }
    return CommandDocumentBinding.withDocument(
      this.session,
      (document) => new TreeCommand(document, this.viewVisitor)
    );
  }
}
