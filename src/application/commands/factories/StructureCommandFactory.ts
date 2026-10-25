import type { EditorSession } from '../../EditorSession.js';
import { AddToCommand } from '../AddToCommand.js';
import { BackShapeCommand } from '../BackShapeCommand.js';
import { FrontShapeCommand } from '../FrontShapeCommand.js';
import { GroupShapesCommand } from '../GroupShapesCommand.js';
import { InvalidCommand } from '../InvalidCommand.js';
import { UngroupShapeCommand } from '../UngroupShapeCommand.js';
import type { Command } from '../contracts/Command.js';
import { CommandDocumentBinding } from '../support/CommandDocumentBinding.js';

export class StructureCommandFactory {
  public constructor(private readonly session: EditorSession) {}

  public createGroup(args: readonly string[]): Command {
    const [groupId, ...targetIds] = args;
    if (groupId === undefined) {
      return new InvalidCommand('group requires a new group id and target ids');
    }
    return CommandDocumentBinding.withDocument(
      this.session,
      (document) => new GroupShapesCommand(document, groupId, targetIds)
    );
  }

  public createUngroup(args: readonly string[]): Command {
    const [groupId] = args;
    if (groupId === undefined || args.length !== 1) {
      return new InvalidCommand('ungroup requires one container id');
    }
    return CommandDocumentBinding.withDocument(
      this.session,
      (document) => new UngroupShapeCommand(document, groupId)
    );
  }

  public createAddTo(args: readonly string[]): Command {
    const [containerId, shapeId] = args;
    if (containerId === undefined || shapeId === undefined || args.length !== 2) {
      return new InvalidCommand('addto requires a container id and a shape id');
    }
    return CommandDocumentBinding.withDocument(
      this.session,
      (document) => new AddToCommand(document, containerId, shapeId)
    );
  }

  public createReorder(
    args: readonly string[],
    direction: 'front' | 'back'
  ): Command {
    const [shapeId] = args;
    if (shapeId === undefined || args.length !== 1) {
      return new InvalidCommand(`${direction} requires one shape id`);
    }
    return CommandDocumentBinding.withDocument(
      this.session,
      (document) =>
        direction === 'front'
          ? new FrontShapeCommand(document, shapeId)
          : new BackShapeCommand(document, shapeId)
    );
  }
}
