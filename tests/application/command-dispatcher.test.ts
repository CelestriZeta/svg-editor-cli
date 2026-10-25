import { describe, expect, it } from 'vitest';

import { CommandDispatcher } from '../../src/application/CommandDispatcher.js';
import { AddToCommand } from '../../src/application/commands/AddToCommand.js';
import { BackShapeCommand } from '../../src/application/commands/BackShapeCommand.js';
import { CreateShapeCommand } from '../../src/application/commands/CreateShapeCommand.js';
import { DeleteShapeCommand } from '../../src/application/commands/DeleteShapeCommand.js';
import { FrontShapeCommand } from '../../src/application/commands/FrontShapeCommand.js';
import { GroupShapesCommand } from '../../src/application/commands/GroupShapesCommand.js';
import { HelpCommand } from '../../src/application/commands/HelpCommand.js';
import { InitCommand } from '../../src/application/commands/InitCommand.js';
import { InvalidCommand } from '../../src/application/commands/InvalidCommand.js';
import { MoveShapeCommand } from '../../src/application/commands/MoveShapeCommand.js';
import { ReadDocumentCommand } from '../../src/application/commands/ReadDocumentCommand.js';
import { RedoCommand } from '../../src/application/commands/RedoCommand.js';
import { ResizeCanvasCommand } from '../../src/application/commands/ResizeCanvasCommand.js';
import { SaveCommand } from '../../src/application/commands/SaveCommand.js';
import { ScaleShapeCommand } from '../../src/application/commands/ScaleShapeCommand.js';
import { SetShapeAttributeCommand } from '../../src/application/commands/SetShapeAttributeCommand.js';
import { ShowCanvasCommand } from '../../src/application/commands/ShowCanvasCommand.js';
import { ShowCommand } from '../../src/application/commands/ShowCommand.js';
import { TreeCommand } from '../../src/application/commands/TreeCommand.js';
import { UngroupShapeCommand } from '../../src/application/commands/UngroupShapeCommand.js';
import { UndoCommand } from '../../src/application/commands/UndoCommand.js';
import { ErrorResult } from '../../src/application/commands/results/ErrorResult.js';
import { CommandHistory } from '../../src/application/CommandHistory.js';
import { DocumentService } from '../../src/application/DocumentService.js';
import { EditorSession } from '../../src/application/EditorSession.js';
import { DocumentViewVisitor } from '../../src/application/queries/DocumentViewVisitor.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

function createDispatcher(): {
  readonly dispatcher: CommandDispatcher;
  readonly session: EditorSession;
} {
  const session = new EditorSession();
  const documents = new DocumentService(session, new RecordingDocumentStore());
  const history = new CommandHistory();
  return {
    dispatcher: new CommandDispatcher(
      session,
      documents,
      history,
      new DocumentViewVisitor()
    ),
    session
  };
}

describe('CommandDispatcher', () => {
  it('[CMD-01] creates the expected command for every implemented name', async () => {
    const { dispatcher } = createDispatcher();

    expect(dispatcher.create(['init'])).toBeInstanceOf(InitCommand);
    await dispatcher.create(['init', '100', '50']).execute();
    expect(dispatcher.create(['read', 'input.svg'])).toBeInstanceOf(
      ReadDocumentCommand
    );
    expect(dispatcher.create(['create', 'g', 'g1'])).toBeInstanceOf(
      CreateShapeCommand
    );
    await dispatcher.create(['create', 'g', 'g1']).execute();
    await dispatcher.create(['create', 'rect', 'r1', '0', '0', '1', '1']).execute();
    await dispatcher.create(['create', 'circle', 'c1', '2', '2', '1']).execute();
    expect(dispatcher.create(['delete', 'r1'])).toBeInstanceOf(
      DeleteShapeCommand
    );
    expect(dispatcher.create(['move', 'r1', '1', '2'])).toBeInstanceOf(
      MoveShapeCommand
    );
    expect(dispatcher.create(['scale', 'r1', '2'])).toBeInstanceOf(
      ScaleShapeCommand
    );
    expect(dispatcher.create(['set', 'r1', 'fill', 'red'])).toBeInstanceOf(
      SetShapeAttributeCommand
    );
    expect(dispatcher.create(['group', 'cluster', 'r1', 'c1'])).toBeInstanceOf(
      GroupShapesCommand
    );
    expect(dispatcher.create(['ungroup', 'g1'])).toBeInstanceOf(
      UngroupShapeCommand
    );
    expect(dispatcher.create(['addto', 'g1', 'r1'])).toBeInstanceOf(AddToCommand);
    expect(dispatcher.create(['front', 'r1'])).toBeInstanceOf(FrontShapeCommand);
    expect(dispatcher.create(['back', 'r1'])).toBeInstanceOf(BackShapeCommand);
    expect(dispatcher.create(['tree'])).toBeInstanceOf(TreeCommand);
    expect(dispatcher.create(['tree', 'g1'])).toBeInstanceOf(TreeCommand);
    expect(dispatcher.create(['show', 'r1'])).toBeInstanceOf(ShowCommand);
    expect(dispatcher.create(['undo'])).toBeInstanceOf(UndoCommand);
    expect(dispatcher.create(['redo'])).toBeInstanceOf(RedoCommand);
    expect(dispatcher.create(['save'])).toBeInstanceOf(SaveCommand);
    expect(dispatcher.create(['canvas'])).toBeInstanceOf(ShowCanvasCommand);
    expect(dispatcher.create(['canvas', '100', '50'])).toBeInstanceOf(
      ResizeCanvasCommand
    );
    expect(dispatcher.create(['help'])).toBeInstanceOf(HelpCommand);
  });

  it('[CMD-02/03] returns semantic errors for unknown commands and invalid arity', async () => {
    const { dispatcher } = createDispatcher();
    await dispatcher.create(['init']).execute();
    const cases: readonly [readonly string[], string][] = [
      [[], 'missing command'],
      [['missing'], 'unknown command: missing'],
      [['init', '1'], 'init requires zero or two arguments'],
      [['read'], 'read requires one file path'],
      [['read', 'a.svg', 'b.svg'], 'read requires one file path'],
      [['create', 'rect'], 'create requires a type and id'],
      [['create', 'g', 'g1', 'in'], "create g requires a container after 'in'"],
      [['delete'], 'delete requires one shape id'],
      [['delete', 'r1', 'extra'], 'delete requires one shape id'],
      [['move', 'r1', '1'], 'move requires a shape id, dx and dy'],
      [['move', 'r1', '1', '2', 'extra'], 'move requires a shape id, dx and dy'],
      [['scale', 'r1'], 'scale requires a shape id and factor'],
      [['scale', 'r1', '2', 'extra'], 'scale requires a shape id and factor'],
      [['set', 'r1', 'fill'], 'set requires a shape id, attribute and value'],
      [
        ['set', 'r1', 'fill', 'red', 'extra'],
        'set requires a shape id, attribute and value'
      ],
      [['group'], 'group requires a new group id and target ids'],
      [['ungroup'], 'ungroup requires one container id'],
      [['ungroup', 'g1', 'extra'], 'ungroup requires one container id'],
      [['addto', 'g1'], 'addto requires a container id and a shape id'],
      [['front'], 'front requires one shape id'],
      [['back', 'r1', 'extra'], 'back requires one shape id'],
      [['tree', 'r1', 'extra'], 'tree takes at most one argument'],
      [['show'], 'show requires one shape id'],
      [['show', 'r1', 'extra'], 'show requires one shape id'],
      [['undo', 'extra'], 'undo takes no arguments'],
      [['redo', 'extra'], 'redo takes no arguments'],
      [['save', 'a.svg', 'b.svg'], 'save accepts at most one file path'],
      [['canvas', '1'], 'canvas requires zero or two arguments'],
      [['canvas', '1', '2', '3'], 'canvas requires zero or two arguments'],
      [['help', 'extra'], 'help takes no arguments']
    ];

    for (const [tokens, message] of cases) {
      const command = dispatcher.create(tokens);
      expect(command).toBeInstanceOf(InvalidCommand);
      const result = await command.execute();
      expect(result).toBeInstanceOf(ErrorResult);
      expect((result as ErrorResult).text).toBe(message);
    }
  });

  it('[CREATE-11, CMD-03] binds create-in to an existing container', async () => {
    const { dispatcher, session } = createDispatcher();
    await dispatcher.create(['init']).execute();
    await dispatcher.create(['create', 'g', 'g1']).execute();

    const command = dispatcher.create([
      'create',
      'rect',
      'r1',
      '-1.5',
      '2.25',
      '3.5',
      '4.5',
      'red',
      'in',
      'g1'
    ]);
    expect(command).toBeInstanceOf(CreateShapeCommand);
    await command.execute();

    const document = session.requireDocument();
    expect(document.parentOf('r1')?.id).toBe('g1');
    expect(document.requireShape('r1')).toMatchObject({
      x: -1.5,
      y: 2.25,
      width: 3.5,
      height: 4.5
    });
  });
});
