import type { ShapeCatalog } from '../../../application/extensions/ShapeCatalog.js';
import { DomainError } from '../../../domain/DomainError.js';
import { ShapeSpec } from '../../../domain/specs/ShapeSpec.js';
import type { ActiveDocument } from '../../../application/ports/ActiveDocument.js';
import { CreateShapeCommand } from '../commands/CreateShapeCommand.js';
import { InvalidCommand } from '../../../application/commands/InvalidCommand.js';
import type { Command } from '../../../application/commands/contracts/Command.js';
import { CommandDocumentBinding } from '../../../application/commands/support/CommandDocumentBinding.js';

export class CreateShapeCommandFactory {
  public constructor(
    private readonly session: ActiveDocument,
    private readonly shapes: ShapeCatalog
  ) {}

  public create(args: readonly string[]): Command {
    const [type, id, ...parameters] = args;
    if (type === undefined || id === undefined) {
      return new InvalidCommand('create requires a type and id');
    }

    return CommandDocumentBinding.withDocument(this.session, (document) => {
      const parentMarker = parameters.length - 2;
      const hasParent =
        parentMarker >= 0 && parameters[parentMarker] === 'in';
      if (!hasParent && parameters.at(-1) === 'in') {
        throw new DomainError(`create ${type} requires a container after 'in'`);
      }
      const shapeParameters = hasParent
        ? parameters.slice(0, parentMarker)
        : parameters;
      const spec = this.createSpec(type, id, shapeParameters);
      const parentId = hasParent ? parameters[parentMarker + 1] : undefined;
      if (hasParent && parentId === undefined) {
        throw new DomainError(`create ${type} requires a container after 'in'`);
      }
      const parent =
        parentId === undefined ? undefined : document.requireContainer(parentId);
      return new CreateShapeCommand(document, spec, parent);
    });
  }

  private createSpec(
    type: string,
    id: string,
    parameters: readonly string[]
  ): ShapeSpec {
    const builder = this.shapes.findShape(type);
    if (builder === undefined) {
      throw new DomainError(
        `unknown shape type: ${type} (is the plugin loaded?)`
      );
    }
    const spec = builder.createSpec(id, parameters);
    if (!(spec instanceof ShapeSpec) || spec.id !== id || spec.type !== type) {
      throw new DomainError(`invalid shape specification: ${type}`);
    }
    return spec;
  }
}
