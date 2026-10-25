import type { DocumentService } from '../../DocumentService.js';
import { InitCommand } from '../InitCommand.js';
import { InvalidCommand } from '../InvalidCommand.js';
import { SaveCommand } from '../SaveCommand.js';
import type { CommandNumberParser } from '../support/CommandNumberParser.js';
import type { Command } from '../contracts/Command.js';

export class DocumentCommandFactory {
  public constructor(
    private readonly documents: DocumentService,
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
}
