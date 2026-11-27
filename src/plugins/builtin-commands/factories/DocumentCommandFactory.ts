import type { DocumentOperations } from '../../../application/ports/DocumentOperations.js';
import type { Command } from '../../../application/commands/contracts/Command.js';
import { InitCommand } from '../commands/InitCommand.js';
import { InvalidCommand } from '../../../application/commands/InvalidCommand.js';
import { ReadDocumentCommand } from '../commands/ReadDocumentCommand.js';
import { ResizeCanvasCommand } from '../commands/ResizeCanvasCommand.js';
import { SaveCommand } from '../commands/SaveCommand.js';
import { ShowCanvasCommand } from '../commands/ShowCanvasCommand.js';
import type { CommandNumberParser } from '../../../application/commands/support/CommandNumberParser.js';

export class DocumentCommandFactory {
  public constructor(
    private readonly documents: DocumentOperations,
    private readonly numbers: CommandNumberParser
  ) {}

  public createInit(args: readonly string[]): Command {
    if (args.length === 0) {
      return new InitCommand(this.documents, 800, 600);
    }
    if (args.length !== 2) {
      return new InvalidCommand('init requires zero or two arguments');
    }

    return new InitCommand(
      this.documents,
      this.numbers.parseCanvas(args[0]),
      this.numbers.parseCanvas(args[1])
    );
  }

  public createSave(args: readonly string[]): Command {
    if (args.length > 1) {
      return new InvalidCommand('save accepts at most one file path');
    }
    return new SaveCommand(this.documents, args[0]);
  }

  public createRead(args: readonly string[]): Command {
    if (args.length !== 1) {
      return new InvalidCommand('read requires one file path');
    }
    return new ReadDocumentCommand(this.documents, args[0] ?? '');
  }

  public createCanvas(args: readonly string[]): Command {
    if (args.length === 0) {
      return new ShowCanvasCommand(this.documents);
    }
    if (args.length !== 2) {
      return new InvalidCommand('canvas requires zero or two arguments');
    }

    return new ResizeCanvasCommand(
      this.documents,
      this.numbers.parseCanvas(args[0]),
      this.numbers.parseCanvas(args[1])
    );
  }
}
