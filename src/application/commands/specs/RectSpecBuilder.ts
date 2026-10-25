import { DomainError } from '../../../domain/DomainError.js';
import { ShapeStyle } from '../../../domain/shapes/ShapeStyle.js';
import { RectSpec } from '../../../domain/specs/RectSpec.js';
import type { ShapeSpec } from '../../../domain/specs/ShapeSpec.js';
import type { ShapeSpecBuilder } from '../contracts/ShapeSpecBuilder.js';
import type { CommandNumberParser } from '../support/CommandNumberParser.js';

export class RectSpecBuilder implements ShapeSpecBuilder {
  public constructor(private readonly numbers: CommandNumberParser) {}

  public create(id: string, parameters: readonly string[]): ShapeSpec {
    if (parameters.length !== 4 && parameters.length !== 5) {
      throw new DomainError('rect requires x, y, width and height');
    }

    const [xText, yText, widthText, heightText, fill] = parameters;
    return new RectSpec(
      id,
      this.numbers.parseShape('rect', xText, 'x'),
      this.numbers.parseShape('rect', yText, 'y'),
      this.numbers.parseShape('rect', widthText, 'width'),
      this.numbers.parseShape('rect', heightText, 'height'),
      new ShapeStyle(fill)
    );
  }
}
