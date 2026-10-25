import { DomainError } from '../../../domain/DomainError.js';
import type { ShapeSpec } from '../../../domain/specs/ShapeSpec.js';
import type { EditorSession } from '../../EditorSession.js';
import { CreateShapeCommand } from '../CreateShapeCommand.js';
import { InvalidCommand } from '../InvalidCommand.js';
import type { Command } from '../contracts/Command.js';
import type { ShapeSpecBuilder } from '../contracts/ShapeSpecBuilder.js';
import { CircleSpecBuilder } from '../specs/CircleSpecBuilder.js';
import { EllipseSpecBuilder } from '../specs/EllipseSpecBuilder.js';
import { GroupSpecBuilder } from '../specs/GroupSpecBuilder.js';
import { LineSpecBuilder } from '../specs/LineSpecBuilder.js';
import { RectSpecBuilder } from '../specs/RectSpecBuilder.js';
import { TextSpecBuilder } from '../specs/TextSpecBuilder.js';
import type { CommandNumberParser } from '../support/CommandNumberParser.js';
import { CommandDocumentBinding } from '../support/CommandDocumentBinding.js';

export class CreateShapeCommandFactory {
  readonly #shapeSpecBuilders: ReadonlyMap<string, ShapeSpecBuilder>;

  public constructor(
    private readonly session: EditorSession,
    numbers: CommandNumberParser
  ) {
    this.#shapeSpecBuilders = new Map<string, ShapeSpecBuilder>([
      ['rect', new RectSpecBuilder(numbers)],
      ['circle', new CircleSpecBuilder(numbers)],
      ['ellipse', new EllipseSpecBuilder(numbers)],
      ['line', new LineSpecBuilder(numbers)],
      ['text', new TextSpecBuilder(numbers)],
      ['g', new GroupSpecBuilder()]
    ]);
  }

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
    const builder = this.#shapeSpecBuilders.get(type);
    if (builder === undefined) {
      throw new DomainError(
        `unknown shape type: ${type} (is the plugin loaded?)`
      );
    }
    return builder.create(id, parameters);
  }
}
