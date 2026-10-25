import { ShapeAttributeUpdate } from '../../../domain/shapes/ShapeAttributeUpdate.js';
import { ShapeAttributeValueKind } from '../../../domain/shapes/ShapeAttributeValueKind.js';
import type { EditorSession } from '../../EditorSession.js';
import { DeleteShapeCommand } from '../DeleteShapeCommand.js';
import { InvalidCommand } from '../InvalidCommand.js';
import { MoveShapeCommand } from '../MoveShapeCommand.js';
import { ScaleShapeCommand } from '../ScaleShapeCommand.js';
import { SetShapeAttributeCommand } from '../SetShapeAttributeCommand.js';
import type { Command } from '../contracts/Command.js';
import type { CommandNumberParser } from '../support/CommandNumberParser.js';
import { CommandDocumentBinding } from '../support/CommandDocumentBinding.js';

export class ShapeEditCommandFactory {
  public constructor(
    private readonly session: EditorSession,
    private readonly numbers: CommandNumberParser
  ) {}

  public createDelete(args: readonly string[]): Command {
    const [shapeId] = args;
    if (shapeId === undefined || args.length !== 1) {
      return new InvalidCommand('delete requires one shape id');
    }
    return CommandDocumentBinding.withDocument(
      this.session,
      (document) => new DeleteShapeCommand(document, shapeId)
    );
  }

  public createMove(args: readonly string[]): Command {
    const [shapeId, rawDx, rawDy] = args;
    if (
      shapeId === undefined ||
      rawDx === undefined ||
      rawDy === undefined ||
      args.length !== 3
    ) {
      return new InvalidCommand('move requires a shape id, dx and dy');
    }
    return CommandDocumentBinding.withDocument(this.session, (document) => {
      const dx = this.numbers.parseShape('move', rawDx, 'dx');
      const dy = this.numbers.parseShape('move', rawDy, 'dy');
      return new MoveShapeCommand(document, shapeId, dx, dy);
    });
  }

  public createScale(args: readonly string[]): Command {
    const [shapeId, rawFactor] = args;
    if (shapeId === undefined || rawFactor === undefined || args.length !== 2) {
      return new InvalidCommand('scale requires a shape id and factor');
    }
    return CommandDocumentBinding.withDocument(this.session, (document) => {
      const factor = this.numbers.parseShape('scale', rawFactor, 'factor');
      return new ScaleShapeCommand(document, shapeId, factor);
    });
  }

  public createSet(args: readonly string[]): Command {
    const [shapeId, attribute, value] = args;
    if (
      shapeId === undefined ||
      attribute === undefined ||
      value === undefined ||
      args.length !== 3
    ) {
      return new InvalidCommand(
        'set requires a shape id, attribute and value'
      );
    }
    return CommandDocumentBinding.withDocument(this.session, (document) => {
      const shape = document.requireShape(shapeId);
      const update =
        shape.attributeKind(attribute) === ShapeAttributeValueKind.Number
          ? ShapeAttributeUpdate.number(
              attribute,
              this.numbers.parseShape('set', value, attribute)
            )
          : ShapeAttributeUpdate.text(attribute, value);
      return new SetShapeAttributeCommand(document, shapeId, update);
    });
  }
}
