import { DomainError } from '../../domain/DomainError.js';
import { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';
import { EllipseSpec } from '../../domain/specs/EllipseSpec.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';
import type { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';

export class EllipseShapeProvider implements ShapeProvider {
  public readonly name = 'ellipse';
  public readonly syntaxes = Object.freeze(['create ellipse <id> <cx> <cy> <rx> <ry> [fill] [in <container-id>]']);

  public constructor(private readonly numbers: CommandNumberParser) {}

  public createSpec(id: string, parameters: readonly string[]): ShapeSpec {
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
      new ShapeStyle(fill)
    );
  }
}
