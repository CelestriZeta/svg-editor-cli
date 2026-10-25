import { DomainError } from '../../../domain/DomainError.js';
import type { SvgDocument } from '../../../domain/document/SvgDocument.js';
import type { EditorSession } from '../../EditorSession.js';
import type { Command } from '../contracts/Command.js';
import { InvalidCommand } from '../InvalidCommand.js';

export class CommandDocumentBinding {
  public static withDocument(
    session: EditorSession,
    factory: (document: SvgDocument) => Command
  ): Command {
    try {
      return factory(session.requireDocument());
    } catch (error) {
      if (error instanceof DomainError) {
        return new InvalidCommand(error.message);
      }
      throw error;
    }
  }
}
