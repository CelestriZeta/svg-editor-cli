import type { ShapeProvider } from '../../src/application/extensions/ShapeProvider.js';
import { RectSpecBuilder } from '../../src/plugins/builtin-commands/specs/RectSpecBuilder.js';
import { CommandNumberParser } from '../../src/application/commands/support/CommandNumberParser.js';
import type { ShapeSpec } from '../../src/domain/specs/ShapeSpec.js';

export class RegistrationTestShape implements ShapeProvider {
  public readonly name = 'rect';
  public readonly syntaxes = Object.freeze(['create rect <id> <x> <y> <w> <h> [fill]']);
  readonly #builder = new RectSpecBuilder(new CommandNumberParser());

  public createSpec(id: string, parameters: readonly string[]): ShapeSpec {
    return this.#builder.create(id, parameters);
  }
}
