import { DomainError } from '../../../domain/DomainError.js';
import type { ShapeSpec } from '../../../domain/specs/ShapeSpec.js';
import { TextSpec } from '../../../domain/specs/TextSpec.js';
import type { ShapeSpecBuilder } from '../contracts/ShapeSpecBuilder.js';
import type { CommandNumberParser } from '../support/CommandNumberParser.js';

export class TextSpecBuilder implements ShapeSpecBuilder {
  public constructor(private readonly numbers: CommandNumberParser) {}

  public create(id: string, parameters: readonly string[]): ShapeSpec {
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
