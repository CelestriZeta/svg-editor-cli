import { Circle } from '../../domain/shapes/Circle.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import { GeometrySnapshot } from '../../application/queries/GeometrySnapshot.js';
import { ShapeAnchor } from '../../application/queries/ShapeAnchor.js';
import { SvgContentKind } from '../../application/ports/SvgContentKind.js';
import type { SvgShapeInput } from '../../application/ports/SvgShapeInput.js';
import { SvgShapeOutput } from '../../application/ports/SvgShapeOutput.js';
import { DomainError } from '../../domain/DomainError.js';
import { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';
import { CircleSpec } from '../../domain/specs/CircleSpec.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';
import type { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';

export class CircleShapeProvider implements ShapeProvider {
  public readonly svgTag = 'circle';
  public readonly content = SvgContentKind.Empty;
  public readonly name = 'circle';
  public readonly syntaxes = Object.freeze(['create circle <id> <cx> <cy> <r> [fill] [in <container-id>]']);

  public constructor(private readonly numbers: CommandNumberParser) {}

  public createSpec(id: string, parameters: readonly string[]): ShapeSpec {
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
  public project(shape: Shape): GeometrySnapshot {
    const target = this.requireShape(shape);
    return GeometrySnapshot.named([
      ['cx', target.cx], ['cy', target.cy], ['r', target.r]
    ], new ShapeAnchor(target.cx, target.cy));
  }

  public encode(shape: Shape): SvgShapeOutput {
    const target = this.requireShape(shape);
    return new SvgShapeOutput([['cx', target.cx], ['cy', target.cy], ['r', target.r]]);
  }

  public decode(input: SvgShapeInput): ShapeSpec {
    input.requireSupported(['id', 'cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width']);
    return new CircleSpec(input.id, input.requireNumber('cx'), input.requireNumber('cy'), input.requireNumber('r'), input.style());
  }

  public validateImported(shape: Shape): void {
    this.requireShape(shape);
  }

  private requireShape(shape: Shape): Circle {
    if (!(shape instanceof Circle)) throw new DomainError('invalid shape instance: circle');
    return shape;
  }
}
