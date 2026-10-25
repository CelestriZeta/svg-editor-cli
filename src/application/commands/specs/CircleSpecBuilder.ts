import { DomainError } from '../../../domain/DomainError.js';
import { ShapeStyle } from '../../../domain/shapes/ShapeStyle.js';
import { CircleSpec } from '../../../domain/specs/CircleSpec.js';
import type { ShapeSpec } from '../../../domain/specs/ShapeSpec.js';
import type { ShapeSpecBuilder } from '../contracts/ShapeSpecBuilder.js';
import type { CommandNumberParser } from '../support/CommandNumberParser.js';

export class CircleSpecBuilder implements ShapeSpecBuilder {
  public constructor(private readonly numbers: CommandNumberParser) {}

  public create(id: string, parameters: readonly string[]): ShapeSpec {
    if (parameters.length !== 3 && parameters.length !== 4) {
      throw new DomainError('circle requires cx, cy and r');
    }

    const [cxText, cyText, rText, fill] = parameters;
    return new CircleSpec(
      id,
      this.numbers.parseShape('circle', cxText, 'cx'),
      this.numbers.parseShape('circle', cyText, 'cy'),
      this.numbers.parseShape('circle', rText, 'r'),
      new ShapeStyle(fill)
    );
  }
}
