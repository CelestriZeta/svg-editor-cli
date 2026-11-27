import { DomainError } from '../../domain/DomainError.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import { TextSpec } from '../../domain/specs/TextSpec.js';
import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';
import type { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';

export class TextShapeProvider implements ShapeProvider {
  public readonly name = 'text';
  public readonly syntaxes = Object.freeze(['create text <id> <x> <y> "content" [in <container-id>]']);

  public constructor(private readonly numbers: CommandNumberParser) {}

  public createSpec(id: string, parameters: readonly string[]): ShapeSpec {
    if (parameters.length !== 3) {
      throw new DomainError('text requires x, y and content');
    }

    const [xText, yText, content] = parameters;
    return new TextSpec(
      id,
      this.numbers.parseShape('text', xText, 'x'),
      this.numbers.parseShape('text', yText, 'y'),
      content ?? ''
    );
  }
}
