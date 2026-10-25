import type { CommandHistory } from './CommandHistory.js';
import type { Command } from './commands/contracts/Command.js';
import { CreateShapeCommandFactory } from './commands/factories/CreateShapeCommandFactory.js';
import { DocumentCommandFactory } from './commands/factories/DocumentCommandFactory.js';
import { HistoryCommandFactory } from './commands/factories/HistoryCommandFactory.js';
import { QueryCommandFactory } from './commands/factories/QueryCommandFactory.js';
import { ShapeEditCommandFactory } from './commands/factories/ShapeEditCommandFactory.js';
import { StructureCommandFactory } from './commands/factories/StructureCommandFactory.js';
import { HelpCommand } from './commands/HelpCommand.js';
import { InvalidCommand } from './commands/InvalidCommand.js';
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
    const structureEdits = new StructureCommandFactory(session);
    const historyCommands = new HistoryCommandFactory(session, history);
    const queries = new QueryCommandFactory(session, viewVisitor);

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
        syntax:
          'create <rect|circle|ellipse|line|text|g> <id> [params...] [in <container-id>]',
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
        create: (args) => structureEdits.createGroup(args)
      },
      {
        name: 'ungroup',
        syntax: 'ungroup <gid>',
        create: (args) => structureEdits.createUngroup(args)
      },
      {
        name: 'addto',
        syntax: 'addto <gid> <id>',
        create: (args) => structureEdits.createAddTo(args)
      },
      {
        name: 'front',
        syntax: 'front <id>',
        create: (args) => structureEdits.createReorder(args, 'front')
      },
      {
        name: 'back',
        syntax: 'back <id>',
        create: (args) => structureEdits.createReorder(args, 'back')
      },
      {
        name: 'tree',
        syntax: 'tree',
        create: (args) => queries.createTree(args)
      },
      {
        name: 'undo',
        syntax: 'undo',
        create: (args) => historyCommands.createUndo(args)
      },
      {
        name: 'redo',
        syntax: 'redo',
        create: (args) => historyCommands.createRedo(args)
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

  private createHelp(args: readonly string[]): Command {
    if (args.length !== 0) {
      return new InvalidCommand('help takes no arguments');
    }

    return new HelpCommand(
      [...this.#definitions.values()].map((definition) => definition.syntax)
    );
  }
}
