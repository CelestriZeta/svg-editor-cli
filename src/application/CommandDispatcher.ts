import type { SvgDocument } from '../domain/document/SvgDocument.js';
import { CommandDocumentBinding } from './commands/support/CommandDocumentBinding.js';
import { AddToCommand } from './commands/AddToCommand.js';
import { BackShapeCommand } from './commands/BackShapeCommand.js';
import { FrontShapeCommand } from './commands/FrontShapeCommand.js';
import { GroupShapesCommand } from './commands/GroupShapesCommand.js';
import { UngroupShapeCommand } from './commands/UngroupShapeCommand.js';
import { UndoCommand } from './commands/UndoCommand.js';
import { RedoCommand } from './commands/RedoCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import { ShowCommand } from './commands/ShowCommand.js';
import type { CommandHistory } from './CommandHistory.js';
import type { Command } from './commands/contracts/Command.js';
import { CreateShapeCommandFactory } from './commands/factories/CreateShapeCommandFactory.js';
import { DocumentCommandFactory } from './commands/factories/DocumentCommandFactory.js';
import { ShapeEditCommandFactory } from './commands/factories/ShapeEditCommandFactory.js';
import { HelpCommand } from './commands/HelpCommand.js';
import { InvalidCommand } from './commands/InvalidCommand.js';
import { CommandNumberParser } from './commands/support/CommandNumberParser.js';
import type { DocumentService } from './DocumentService.js';
import type { EditorSession } from './EditorSession.js';
import type { DocumentViewVisitor } from './queries/DocumentViewVisitor.js';

interface CommandDefinition {
  readonly name: string;
  readonly syntax: string | readonly string[];
  create(args: readonly string[]): Command;
}

export class CommandDispatcher {
  readonly #definitions: ReadonlyMap<string, CommandDefinition>;

  public constructor(
    session: EditorSession,
    documents: DocumentService,
    history: CommandHistory,
    viewVisitor: DocumentViewVisitor
  ) {
    const numbers = new CommandNumberParser();
    const documentCommands = new DocumentCommandFactory(documents, numbers);
    const createShape = new CreateShapeCommandFactory(session, numbers);
    const shapeEdits = new ShapeEditCommandFactory(session, numbers);
    const inDocument = (create: (document: SvgDocument) => Command): Command =>
      CommandDocumentBinding.withDocument(session, create);

    const definitions: CommandDefinition[] = [
      {
        name: 'init',
        syntax: 'init [w] [h]',
        create: (args) => documentCommands.createInit(args)
      },
      {
        name: 'read',
        syntax: 'read <file.svg>',
        create: (args) => documentCommands.createRead(args)
      },
      {
        name: 'create',
        syntax: [
          'create rect <id> <x> <y> <w> <h> [fill] [in <container-id>]',
          'create circle <id> <cx> <cy> <r> [fill] [in <container-id>]',
          'create ellipse <id> <cx> <cy> <rx> <ry> [fill] [in <container-id>]',
          'create line <id> <x1> <y1> <x2> <y2> [stroke] [in <container-id>]',
          'create text <id> <x> <y> "content" [in <container-id>]',
          'create g <id> [in <container-id>]'
        ],
        create: (args) => createShape.create(args)
      },
      {
        name: 'delete',
        syntax: 'delete <id>',
        create: (args) => shapeEdits.createDelete(args)
      },
      {
        name: 'move',
        syntax: 'move <id> <dx> <dy>',
        create: (args) => shapeEdits.createMove(args)
      },
      {
        name: 'scale',
        syntax: 'scale <id> <factor>',
        create: (args) => shapeEdits.createScale(args)
      },
      {
        name: 'set',
        syntax: 'set <id> <attribute> <value>',
        create: (args) => shapeEdits.createSet(args)
      },
      {
        name: 'group',
        syntax: 'group <new-gid> <id1> <id2>...',
        create: (args) => args[0] === undefined
          ? new InvalidCommand('group requires a new group id and target ids')
          : inDocument((document) => new GroupShapesCommand(document, args[0] ?? '', args.slice(1)))
      },
      {
        name: 'ungroup',
        syntax: 'ungroup <gid>',
        create: (args) => this.exact(args, 1, 'ungroup requires one container id', () =>
          inDocument((document) => new UngroupShapeCommand(document, args[0] ?? '')))
      },
      {
        name: 'addto',
        syntax: 'addto <gid> <id>',
        create: (args) => this.exact(args, 2, 'addto requires a container id and a shape id', () =>
          inDocument((document) => new AddToCommand(document, args[0] ?? '', args[1] ?? '')))
      },
      {
        name: 'front',
        syntax: 'front <id>',
        create: (args) => this.exact(args, 1, 'front requires one shape id', () =>
          inDocument((document) => new FrontShapeCommand(document, args[0] ?? '')))
      },
      {
        name: 'back',
        syntax: 'back <id>',
        create: (args) => this.exact(args, 1, 'back requires one shape id', () =>
          inDocument((document) => new BackShapeCommand(document, args[0] ?? '')))
      },
      {
        name: 'tree',
        syntax: 'tree [id]',
        create: (args) => args.length > 1
          ? new InvalidCommand('tree takes at most one argument')
          : inDocument((document) => new TreeCommand(document, viewVisitor, args[0]))
      },
      {
        name: 'show',
        syntax: 'show <id>',
        create: (args) => this.exact(args, 1, 'show requires one shape id', () =>
          inDocument((document) => new ShowCommand(document, args[0] ?? '', viewVisitor)))
      },
      {
        name: 'undo',
        syntax: 'undo',
        create: (args) => this.exact(args, 0, 'undo takes no arguments', () =>
          inDocument(() => new UndoCommand(history)))
      },
      {
        name: 'redo',
        syntax: 'redo',
        create: (args) => this.exact(args, 0, 'redo takes no arguments', () =>
          inDocument(() => new RedoCommand(history)))
      },
      {
        name: 'save',
        syntax: 'save [file.svg]',
        create: (args) => documentCommands.createSave(args)
      },
      {
        name: 'canvas',
        syntax: 'canvas [w] [h]',
        create: (args) => documentCommands.createCanvas(args)
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

  private exact(
    args: readonly string[],
    count: number,
    error: string,
    create: () => Command
  ): Command {
    return args.length === count ? create() : new InvalidCommand(error);
  }

  private createHelp(args: readonly string[]): Command {
    if (args.length !== 0) {
      return new InvalidCommand('help takes no arguments');
    }

    return new HelpCommand(
      [...this.#definitions.values()].flatMap((definition) => definition.syntax)
    );
  }
}
