import type { AttributeCatalog } from '../../application/extensions/AttributeCatalog.js';
import type { ShapeCatalog } from '../../application/extensions/ShapeCatalog.js';
import { CreateCommandContribution } from './CreateCommandContribution.js';
import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import { CommandDocumentBinding } from '../../application/commands/support/CommandDocumentBinding.js';
import { AddToCommand } from './commands/AddToCommand.js';
import { BackShapeCommand } from './commands/BackShapeCommand.js';
import { FrontShapeCommand } from './commands/FrontShapeCommand.js';
import { GroupShapesCommand } from './commands/GroupShapesCommand.js';
import { UngroupShapeCommand } from './commands/UngroupShapeCommand.js';
import { UndoCommand } from './commands/UndoCommand.js';
import { RedoCommand } from './commands/RedoCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import { ShowCommand } from './commands/ShowCommand.js';
import type { HistoryController } from '../../application/commands/contracts/HistoryController.js';
import type { Command } from '../../application/commands/contracts/Command.js';
import { CreateShapeCommandFactory } from './factories/CreateShapeCommandFactory.js';
import { DocumentCommandFactory } from './factories/DocumentCommandFactory.js';
import { ShapeEditCommandFactory } from './factories/ShapeEditCommandFactory.js';
import { HelpCommand } from './commands/HelpCommand.js';
import { InvalidCommand } from '../../application/commands/InvalidCommand.js';
import { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';
import type { DocumentOperations } from '../../application/ports/DocumentOperations.js';
import type { ActiveDocument } from '../../application/ports/ActiveDocument.js';
import type { DocumentQuery } from '../../application/queries/DocumentQuery.js';

import type { Plugin } from '../../application/extensions/Plugin.js';
import type { PluginContext } from '../../application/extensions/PluginContext.js';
import type { CommandContribution } from '../../application/extensions/CommandContribution.js';
import type { CommandCatalog } from '../../application/extensions/CommandCatalog.js';
import { BuiltinCommandContribution } from './BuiltinCommandContribution.js';

export class BuiltinCommandsPlugin implements Plugin {
  public constructor(
    private readonly session: ActiveDocument,
    private readonly documents: DocumentOperations,
    private readonly history: HistoryController,
    private readonly viewVisitor: DocumentQuery,
    private readonly catalog: CommandCatalog & ShapeCatalog & Partial<AttributeCatalog>
  ) {}

  public activate(context: PluginContext): void {
    const { session, documents, history, viewVisitor } = this;
    const numbers = new CommandNumberParser();
    const documentCommands = new DocumentCommandFactory(documents, numbers);
    const createShape = new CreateShapeCommandFactory(session, this.catalog);
    const shapeEdits = new ShapeEditCommandFactory(session, numbers, viewVisitor,
      this.catalog.attributeHandlers === undefined ? undefined : { attributeHandlers: () => this.catalog.attributeHandlers!() });
    const inDocument = (create: (document: SvgDocument) => Command): Command =>
      CommandDocumentBinding.withDocument(session, create);

    const definitions: CommandContribution[] = [
      new BuiltinCommandContribution(
        'init',
        'init [w] [h]',
        (args) => documentCommands.createInit(args)
      ),
      new BuiltinCommandContribution(
        'read',
        'read <file.svg>',
        (args) => documentCommands.createRead(args)
      ),
      new CreateCommandContribution(createShape, this.catalog),
      new BuiltinCommandContribution(
        'delete',
        'delete <id>',
        (args) => shapeEdits.createDelete(args)
      ),
      new BuiltinCommandContribution(
        'move',
        'move <id> <dx> <dy>',
        (args) => shapeEdits.createMove(args)
      ),
      new BuiltinCommandContribution(
        'scale',
        'scale <id> <factor>',
        (args) => shapeEdits.createScale(args)
      ),
      new BuiltinCommandContribution(
        'set',
        'set <id> <attribute> <value>',
        (args) => shapeEdits.createSet(args)
      ),
      new BuiltinCommandContribution(
        'group',
        'group <new-gid> <id1> <id2>...',
        (args) => args[0] === undefined
          ? new InvalidCommand('group requires a new group id and target ids')
          : inDocument((document) => new GroupShapesCommand(document, args[0] ?? '', args.slice(1)))
      ),
      new BuiltinCommandContribution(
        'ungroup',
        'ungroup <gid>',
        (args) => this.exact(args, 1, 'ungroup requires one container id', () =>
          inDocument((document) => new UngroupShapeCommand(document, args[0] ?? '')))
      ),
      new BuiltinCommandContribution(
        'addto',
        'addto <gid> <id>',
        (args) => this.exact(args, 2, 'addto requires a container id and a shape id', () =>
          inDocument((document) => new AddToCommand(document, args[0] ?? '', args[1] ?? '')))
      ),
      new BuiltinCommandContribution(
        'front',
        'front <id>',
        (args) => this.exact(args, 1, 'front requires one shape id', () =>
          inDocument((document) => new FrontShapeCommand(document, args[0] ?? '')))
      ),
      new BuiltinCommandContribution(
        'back',
        'back <id>',
        (args) => this.exact(args, 1, 'back requires one shape id', () =>
          inDocument((document) => new BackShapeCommand(document, args[0] ?? '')))
      ),
      new BuiltinCommandContribution(
        'tree',
        'tree [id]',
        (args) => args.length > 1
          ? new InvalidCommand('tree takes at most one argument')
          : inDocument((document) => new TreeCommand(document, viewVisitor, args[0]))
      ),
      new BuiltinCommandContribution(
        'show',
        'show <id>',
        (args) => this.exact(args, 1, 'show requires one shape id', () =>
          inDocument((document) => new ShowCommand(document, args[0] ?? '', viewVisitor)))
      ),
      new BuiltinCommandContribution(
        'undo',
        'undo',
        (args) => this.exact(args, 0, 'undo takes no arguments', () =>
          inDocument(() => new UndoCommand(history)))
      ),
      new BuiltinCommandContribution(
        'redo',
        'redo',
        (args) => this.exact(args, 0, 'redo takes no arguments', () =>
          inDocument(() => new RedoCommand(history)))
      ),
      new BuiltinCommandContribution(
        'save',
        'save [file.svg]',
        (args) => documentCommands.createSave(args)
      ),
      new BuiltinCommandContribution(
        'canvas',
        'canvas [w] [h]',
        (args) => documentCommands.createCanvas(args)
      ),
      new BuiltinCommandContribution(
        'help',
        'help',
        (args) => this.createHelp(args)
      )
    ];
    for (const definition of definitions) {
      context.registerCommand(definition);
    }
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

    return new HelpCommand(this.catalog.commandSyntaxes());
  }
}

export default BuiltinCommandsPlugin;
