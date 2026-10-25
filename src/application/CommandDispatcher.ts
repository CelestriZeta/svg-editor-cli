import { DomainError } from '../domain/DomainError.js';
import type { SvgDocument } from '../domain/document/SvgDocument.js';
import { CircleSpec } from '../domain/specs/CircleSpec.js';
import { EllipseSpec } from '../domain/specs/EllipseSpec.js';
import { GroupSpec } from '../domain/specs/GroupSpec.js';
import { LineSpec } from '../domain/specs/LineSpec.js';
import { RectSpec } from '../domain/specs/RectSpec.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import { TextSpec } from '../domain/specs/TextSpec.js';
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

type ShapeSpecBuilder = (
  id: string,
  parameters: readonly string[]
) => ShapeSpec;

const DECIMAL_NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

export class CommandDispatcher {
  readonly #definitions: ReadonlyMap<string, CommandDefinition>;
  readonly #shapeSpecBuilders: ReadonlyMap<string, ShapeSpecBuilder>;

  public constructor(
    private readonly session: EditorSession,
    private readonly documents: DocumentService,
    private readonly viewVisitor: DocumentViewVisitor
  ) {
    this.#shapeSpecBuilders = new Map<string, ShapeSpecBuilder>([
      ['rect', (id, parameters) => this.createRectSpec(id, parameters)],
      ['circle', (id, parameters) => this.createCircleSpec(id, parameters)],
      ['ellipse', (id, parameters) => this.createEllipseSpec(id, parameters)],
      ['line', (id, parameters) => this.createLineSpec(id, parameters)],
      ['text', (id, parameters) => this.createTextSpec(id, parameters)],
      ['g', (id, parameters) => this.createGroupSpec(id, parameters)]
    ]);

    const definitions: CommandDefinition[] = [
      {
        name: 'init',
        syntax: 'init [w] [h]',
        create: (args) => this.createInit(args)
      },
      {
        name: 'create',
        syntax: 'create <rect|circle|ellipse|line|text|g> <id> [params...]',
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
    const builder = this.#shapeSpecBuilders.get(type);
    if (builder === undefined) {
      throw new DomainError(
        `unknown shape type: ${type} (is the plugin loaded?)`
      );
    }

    return builder(id, parameters);
  }

  private createRectSpec(
    id: string,
    parameters: readonly string[]
  ): RectSpec {
    if (parameters.length !== 4 && parameters.length !== 5) {
      throw new DomainError('rect requires x, y, width and height');
    }

    const [xText, yText, widthText, heightText, fill] = parameters;
    const x = this.parseShapeNumber('rect', xText, 'x');
    const y = this.parseShapeNumber('rect', yText, 'y');
    const width = this.parseShapeNumber('rect', widthText, 'width');
    const height = this.parseShapeNumber('rect', heightText, 'height');
    return new RectSpec(id, x, y, width, height, fill);
  }

  private createCircleSpec(
    id: string,
    parameters: readonly string[]
  ): CircleSpec {
    if (parameters.length !== 3 && parameters.length !== 4) {
      throw new DomainError('circle requires cx, cy and r');
    }

    const [cxText, cyText, rText, fill] = parameters;
    return new CircleSpec(
      id,
      this.parseShapeNumber('circle', cxText, 'cx'),
      this.parseShapeNumber('circle', cyText, 'cy'),
      this.parseShapeNumber('circle', rText, 'r'),
      fill
    );
  }

  private createEllipseSpec(
    id: string,
    parameters: readonly string[]
  ): EllipseSpec {
    if (parameters.length !== 4 && parameters.length !== 5) {
      throw new DomainError('ellipse requires cx, cy, rx and ry');
    }

    const [cxText, cyText, rxText, ryText, fill] = parameters;
    return new EllipseSpec(
      id,
      this.parseShapeNumber('ellipse', cxText, 'cx'),
      this.parseShapeNumber('ellipse', cyText, 'cy'),
      this.parseShapeNumber('ellipse', rxText, 'rx'),
      this.parseShapeNumber('ellipse', ryText, 'ry'),
      fill
    );
  }

  private createLineSpec(
    id: string,
    parameters: readonly string[]
  ): LineSpec {
    if (parameters.length !== 4 && parameters.length !== 5) {
      throw new DomainError('line requires x1, y1, x2 and y2');
    }

    const [x1Text, y1Text, x2Text, y2Text, stroke] = parameters;
    return new LineSpec(
      id,
      this.parseShapeNumber('line', x1Text, 'x1'),
      this.parseShapeNumber('line', y1Text, 'y1'),
      this.parseShapeNumber('line', x2Text, 'x2'),
      this.parseShapeNumber('line', y2Text, 'y2'),
      stroke
    );
  }

  private createTextSpec(
    id: string,
    parameters: readonly string[]
  ): TextSpec {
    if (parameters.length !== 3) {
      throw new DomainError('text requires x, y and content');
    }

    const [xText, yText, content] = parameters;
    return new TextSpec(
      id,
      this.parseShapeNumber('text', xText, 'x'),
      this.parseShapeNumber('text', yText, 'y'),
      content ?? ''
    );
  }

  private createGroupSpec(
    id: string,
    parameters: readonly string[]
  ): GroupSpec {
    if (parameters.length !== 0) {
      throw new DomainError('g does not accept parameters');
    }

    return new GroupSpec(id);
  }

  private parseShapeNumber(
    type: string,
    value: string | undefined,
    field: string
  ): number {
    if (value === undefined || !DECIMAL_NUMBER.test(value)) {
      throw new DomainError(`${type} ${field} must be a number`);
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
