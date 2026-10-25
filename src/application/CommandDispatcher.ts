import { DomainError } from '../domain/DomainError.js';
import type { SvgDocument } from '../domain/document/SvgDocument.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import { AddToCommand } from './commands/AddToCommand.js';
import { BackShapeCommand } from './commands/BackShapeCommand.js';
import { CreateShapeCommand } from './commands/CreateShapeCommand.js';
import { FrontShapeCommand } from './commands/FrontShapeCommand.js';
import { GroupShapesCommand } from './commands/GroupShapesCommand.js';
import type { Command } from './commands/contracts/Command.js';
import type { ShapeSpecBuilder } from './commands/contracts/ShapeSpecBuilder.js';
import { HelpCommand } from './commands/HelpCommand.js';
import { InitCommand } from './commands/InitCommand.js';
import { InvalidCommand } from './commands/InvalidCommand.js';
import { SaveCommand } from './commands/SaveCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import { UngroupShapeCommand } from './commands/UngroupShapeCommand.js';
import { CircleSpecBuilder } from './commands/specs/CircleSpecBuilder.js';
import { EllipseSpecBuilder } from './commands/specs/EllipseSpecBuilder.js';
import { GroupSpecBuilder } from './commands/specs/GroupSpecBuilder.js';
import { LineSpecBuilder } from './commands/specs/LineSpecBuilder.js';
import { RectSpecBuilder } from './commands/specs/RectSpecBuilder.js';
import { TextSpecBuilder } from './commands/specs/TextSpecBuilder.js';
import { CommandNumberParser } from './commands/support/CommandNumberParser.js';
import type { DocumentService } from './DocumentService.js';
import type { EditorSession } from './EditorSession.js';
import type { DocumentViewVisitor } from './queries/DocumentViewVisitor.js';

interface CommandDefinition {
  readonly name: string;
  readonly syntax: string;
  create(args: readonly string[]): Command;
}

export class CommandDispatcher {
  readonly #definitions: ReadonlyMap<string, CommandDefinition>;
  readonly #shapeSpecBuilders: ReadonlyMap<string, ShapeSpecBuilder>;
  readonly #numbers = new CommandNumberParser();

  public constructor(
    private readonly session: EditorSession,
    private readonly documents: DocumentService,
    private readonly viewVisitor: DocumentViewVisitor
  ) {
    this.#shapeSpecBuilders = new Map<string, ShapeSpecBuilder>([
      ['rect', new RectSpecBuilder(this.#numbers)],
      ['circle', new CircleSpecBuilder(this.#numbers)],
      ['ellipse', new EllipseSpecBuilder(this.#numbers)],
      ['line', new LineSpecBuilder(this.#numbers)],
      ['text', new TextSpecBuilder(this.#numbers)],
      ['g', new GroupSpecBuilder()]
    ]);

    const definitions: CommandDefinition[] = [
      {
        name: 'init',
        syntax: 'init [w] [h]',
        create: (args) => this.createInit(args)
      },
      {
        name: 'create',
        syntax:
          'create <rect|circle|ellipse|line|text|g> <id> [params...] [in <container-id>]',
        create: (args) => this.createShape(args)
      },
      {
        name: 'group',
        syntax: 'group <new-gid> <id1> <id2>...',
        create: (args) => this.createGroup(args)
      },
      {
        name: 'ungroup',
        syntax: 'ungroup <gid>',
        create: (args) => this.createUngroup(args)
      },
      {
        name: 'addto',
        syntax: 'addto <gid> <id>',
        create: (args) => this.createAddTo(args)
      },
      {
        name: 'front',
        syntax: 'front <id>',
        create: (args) => this.createReorder(args, 'front')
      },
      {
        name: 'back',
        syntax: 'back <id>',
        create: (args) => this.createReorder(args, 'back')
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
      this.#numbers.parseCanvas(args[0]),
      this.#numbers.parseCanvas(args[1])
    );
  }

  private createShape(args: readonly string[]): Command {
    const [type, id, ...parameters] = args;
    if (type === undefined || id === undefined) {
      return new InvalidCommand('create requires a type and id');
    }

    return this.withDocument((document) => {
      const parentMarker = parameters.length - 2;
      const hasParent =
        parentMarker >= 0 && parameters[parentMarker] === 'in';
      if (!hasParent && parameters.at(-1) === 'in') {
        throw new DomainError(`create ${type} requires a container after 'in'`);
      }
      const shapeParameters = hasParent
        ? parameters.slice(0, parentMarker)
        : parameters;
      const spec = this.createShapeSpec(type, id, shapeParameters);
      const parentId = hasParent ? parameters[parentMarker + 1] : undefined;
      if (hasParent && parentId === undefined) {
        throw new DomainError(`create ${type} requires a container after 'in'`);
      }
      const parent =
        parentId === undefined ? undefined : document.requireContainer(parentId);
      return new CreateShapeCommand(document, spec, parent);
    });
  }

  private createGroup(args: readonly string[]): Command {
    const [groupId, ...targetIds] = args;
    if (groupId === undefined) {
      return new InvalidCommand('group requires a new group id and target ids');
    }

    return this.withDocument(
      (document) => new GroupShapesCommand(document, groupId, targetIds)
    );
  }

  private createUngroup(args: readonly string[]): Command {
    const [groupId] = args;
    if (groupId === undefined || args.length !== 1) {
      return new InvalidCommand('ungroup requires one container id');
    }

    return this.withDocument(
      (document) => new UngroupShapeCommand(document, groupId)
    );
  }

  private createAddTo(args: readonly string[]): Command {
    const [containerId, shapeId] = args;
    if (containerId === undefined || shapeId === undefined || args.length !== 2) {
      return new InvalidCommand('addto requires a container id and a shape id');
    }

    return this.withDocument(
      (document) => new AddToCommand(document, containerId, shapeId)
    );
  }

  private createReorder(
    args: readonly string[],
    direction: 'front' | 'back'
  ): Command {
    const [shapeId] = args;
    if (shapeId === undefined || args.length !== 1) {
      return new InvalidCommand(`${direction} requires one shape id`);
    }

    return this.withDocument((document) =>
      direction === 'front'
        ? new FrontShapeCommand(document, shapeId)
        : new BackShapeCommand(document, shapeId)
    );
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

    return builder.create(id, parameters);
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
