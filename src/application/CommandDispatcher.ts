import { DomainError } from '../domain/DomainError.js';
import type { SvgDocument } from '../domain/document/SvgDocument.js';
import { RectSpec } from '../domain/specs/RectSpec.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import { CreateShapeCommand } from './commands/CreateShapeCommand.js';
import type { Command } from './commands/contracts/Command.js';
import { HelpCommand } from './commands/HelpCommand.js';
import { InitCommand } from './commands/InitCommand.js';
import { InvalidCommand } from './commands/InvalidCommand.js';
import { SaveCommand } from './commands/SaveCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import type { DocumentService } from './DocumentService.js';
import type { EditorSession } from './EditorSession.js';
import type { DocumentViewVisitor } from './queries/DocumentViewVisitor.js';

interface CommandDefinition {
  readonly name: string;
  readonly syntax: string;
  create(args: readonly string[]): Command;
}

const DECIMAL_NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

export class CommandDispatcher {
  readonly #definitions: ReadonlyMap<string, CommandDefinition>;

  public constructor(
    private readonly session: EditorSession,
    private readonly documents: DocumentService,
    private readonly viewVisitor: DocumentViewVisitor
  ) {
    const definitions: CommandDefinition[] = [
      {
        name: 'init',
        syntax: 'init [w] [h]',
        create: (args) => this.createInit(args)
      },
      {
        name: 'create',
        syntax: 'create rect <id> <x> <y> <width> <height> [fill]',
        create: (args) => this.createShape(args)
      },
      {
        name: 'tree',
        syntax: 'tree',
        create: (args) => this.createTree(args)
      },
      {
        name: 'save',
        syntax: 'save [file.svg]',
        create: (args) => this.createSave(args)
      },
      {
        name: 'help',
        syntax: 'help',
        create: (args) => this.createHelp(args)
      }
    ];
    this.#definitions = new Map(
      definitions.map((definition) => [definition.name, definition])
    );
  }

  public create(tokens: readonly string[]): Command {
    const [name, ...args] = tokens;

    if (name === undefined) {
      return new InvalidCommand('missing command');
    }

    const definition = this.#definitions.get(name);
    if (definition === undefined) {
      return new InvalidCommand(`unknown command: ${name}`);
    }

    return definition.create(args);
  }

  private createInit(args: readonly string[]): Command {
    if (args.length === 0) {
      return new InitCommand(this.documents, 800, 600);
    }
    if (args.length !== 2) {
      return new InvalidCommand('init requires zero or two arguments');
    }

    return new InitCommand(
      this.documents,
      this.parseCanvasNumber(args[0]),
      this.parseCanvasNumber(args[1])
    );
  }

  private createShape(args: readonly string[]): Command {
    const [type, id, ...parameters] = args;
    if (type === undefined || id === undefined) {
      return new InvalidCommand('create requires a type and id');
    }

    return this.withDocument((document) => {
      const spec = this.createShapeSpec(type, id, parameters);
      return new CreateShapeCommand(document, spec);
    });
  }

  private createTree(args: readonly string[]): Command {
    if (args.length !== 0) {
      return new InvalidCommand('tree takes no arguments');
    }

    return this.withDocument(
      (document) => new TreeCommand(document, this.viewVisitor)
    );
  }

  private createSave(args: readonly string[]): Command {
    if (args.length > 1) {
      return new InvalidCommand('save accepts at most one file path');
    }

    return new SaveCommand(this.documents, args[0]);
  }

  private createHelp(args: readonly string[]): Command {
    if (args.length !== 0) {
      return new InvalidCommand('help takes no arguments');
    }

    return new HelpCommand(
      [...this.#definitions.values()].map((definition) => definition.syntax)
    );
  }

  private createShapeSpec(
    type: string,
    id: string,
    parameters: readonly string[]
  ): ShapeSpec {
    switch (type) {
      case 'rect':
        return this.createRectSpec(id, parameters);
      default:
        throw new DomainError(
          `unknown shape type: ${type} (is the plugin loaded?)`
        );
    }
  }

  private createRectSpec(
    id: string,
    parameters: readonly string[]
  ): RectSpec {
    if (parameters.length !== 4 && parameters.length !== 5) {
      throw new DomainError('rect requires x, y, width and height');
    }

    const [xText, yText, widthText, heightText, fill] = parameters;
    const x = this.parseRectNumber(xText, 'x');
    const y = this.parseRectNumber(yText, 'y');
    const width = this.parseRectNumber(widthText, 'width');
    const height = this.parseRectNumber(heightText, 'height');
    return new RectSpec(id, x, y, width, height, fill);
  }

  private parseRectNumber(value: string | undefined, field: string): number {
    if (value === undefined || !DECIMAL_NUMBER.test(value)) {
      throw new DomainError(`rect ${field} must be a number`);
    }

    return Number(value);
  }

  private parseCanvasNumber(value: string | undefined): number {
    return value !== undefined && DECIMAL_NUMBER.test(value)
      ? Number(value)
      : Number.NaN;
  }

  private withDocument(factory: (document: SvgDocument) => Command): Command {
    try {
      return factory(this.session.requireDocument());
    } catch (error) {
      if (error instanceof DomainError) {
        return new InvalidCommand(error.message);
      }
      throw error;
    }
  }
}
