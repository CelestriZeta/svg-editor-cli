import { DomainError } from '../../../domain/DomainError.js';
import { EllipseSpec } from '../../../domain/specs/EllipseSpec.js';
import type { ShapeSpec } from '../../../domain/specs/ShapeSpec.js';
import type { ShapeSpecBuilder } from '../contracts/ShapeSpecBuilder.js';
import type { CommandNumberParser } from '../support/CommandNumberParser.js';

export class EllipseSpecBuilder implements ShapeSpecBuilder {
  public constructor(private readonly numbers: CommandNumberParser) {}

  public create(id: string, parameters: readonly string[]): ShapeSpec {
    if (parameters.length !== 4 && parameters.length !== 5) {
      throw new DomainError('ellipse requires cx, cy, rx and ry');
    }

    const [cxText, cyText, rxText, ryText, fill] = parameters;
    return new EllipseSpec(
      id,
      this.numbers.parseShape('ellipse', cxText, 'cx'),
      this.numbers.parseShape('ellipse', cyText, 'cy'),
      this.numbers.parseShape('ellipse', rxText, 'rx'),
      this.numbers.parseShape('ellipse', ryText, 'ry'),
      fill
    );
  }
}
