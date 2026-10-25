import { DomainError } from '../../../domain/DomainError.js';
import { LineSpec } from '../../../domain/specs/LineSpec.js';
import type { ShapeSpec } from '../../../domain/specs/ShapeSpec.js';
import type { ShapeSpecBuilder } from '../contracts/ShapeSpecBuilder.js';
import type { CommandNumberParser } from '../support/CommandNumberParser.js';

export class LineSpecBuilder implements ShapeSpecBuilder {
  public constructor(private readonly numbers: CommandNumberParser) {}

  public create(id: string, parameters: readonly string[]): ShapeSpec {
    if (parameters.length !== 4 && parameters.length !== 5) {
      throw new DomainError('line requires x1, y1, x2 and y2');
    }

    const [x1Text, y1Text, x2Text, y2Text, stroke] = parameters;
    return new LineSpec(
      id,
      this.numbers.parseShape('line', x1Text, 'x1'),
      this.numbers.parseShape('line', y1Text, 'y1'),
      this.numbers.parseShape('line', x2Text, 'x2'),
      this.numbers.parseShape('line', y2Text, 'y2'),
      stroke
    );
  }
}
