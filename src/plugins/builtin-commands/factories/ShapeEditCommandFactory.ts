import type { AttributeCatalog } from '../../../application/extensions/AttributeCatalog.js';
import { AttributeResolver } from '../../../application/extensions/AttributeResolver.js';
import type { DocumentQuery } from '../../../application/queries/DocumentQuery.js';
import { ShapeAttributeUpdate } from '../../../domain/shapes/ShapeAttributeUpdate.js';
import { ShapeAttributeValueKind } from '../../../domain/shapes/ShapeAttributeValueKind.js';
import type { ActiveDocument } from '../../../application/ports/ActiveDocument.js';
import { DeleteShapeCommand } from '../commands/DeleteShapeCommand.js';
import { InvalidCommand } from '../../../application/commands/InvalidCommand.js';
import { MoveShapeCommand } from '../commands/MoveShapeCommand.js';
import { ScaleShapeCommand } from '../commands/ScaleShapeCommand.js';
import { SetShapeAttributeCommand } from '../commands/SetShapeAttributeCommand.js';
import type { Command } from '../../../application/commands/contracts/Command.js';
import type { CommandNumberParser } from '../../../application/commands/support/CommandNumberParser.js';
import { CommandDocumentBinding } from '../../../application/commands/support/CommandDocumentBinding.js';

export class ShapeEditCommandFactory {
  public constructor(
    private readonly session: ActiveDocument,
    private readonly numbers: CommandNumberParser,
    private readonly views: DocumentQuery,
    private readonly attributes?: AttributeCatalog
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
      return new MoveShapeCommand(document, shapeId, dx, dy, this.views);
    });
  }

  public createScale(args: readonly string[]): Command {
    const [shapeId, rawFactor] = args;
    if (shapeId === undefined || rawFactor === undefined || args.length !== 2) {
      return new InvalidCommand('scale requires a shape id and factor');
    }
    return CommandDocumentBinding.withDocument(this.session, (document) => {
      const factor = this.numbers.parseShape('scale', rawFactor, 'factor');
      return new ScaleShapeCommand(document, shapeId, factor, this.views);
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
      return new SetShapeAttributeCommand(document, shapeId, ShapeAttributeUpdate.text(attribute, value), () =>
        new AttributeResolver(this.attributes).prepare(this.views.inspect(shape), attribute, value, {
          prepareSet: (id, update) => document.requireShape(id).prepareSet(update),
          readAttribute: (id, attr) => document.requireShape(id).attributeValue(attr)
        }, () => {
      const update =
        shape.attributeKind(attribute) === ShapeAttributeValueKind.Number
          ? ShapeAttributeUpdate.number(
              attribute,
              this.numbers.parseShape('set', value, attribute)
            )
          : ShapeAttributeUpdate.text(attribute, value);
      return { changeSet: shape.prepareSet(update), readValue: () => shape.attributeValue(attribute) };
        }));
    });
  }
}
