import { Ellipse } from '../../domain/shapes/Ellipse.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import { GeometrySnapshot } from '../../application/queries/GeometrySnapshot.js';
import { ShapeAnchor } from '../../application/queries/ShapeAnchor.js';
import { SvgContentKind } from '../../application/ports/SvgContentKind.js';
import type { SvgShapeInput } from '../../application/ports/SvgShapeInput.js';
import { SvgShapeOutput } from '../../application/ports/SvgShapeOutput.js';
import { DomainError } from '../../domain/DomainError.js';
import { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';
import { EllipseSpec } from '../../domain/specs/EllipseSpec.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';
import type { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';

export class EllipseShapeProvider implements ShapeProvider {
  public readonly svgTag = 'ellipse';
  public readonly content = SvgContentKind.Empty;
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
  public project(shape: Shape): GeometrySnapshot {
    const target = this.requireShape(shape);
    return GeometrySnapshot.named([
      ['cx', target.cx], ['cy', target.cy], ['rx', target.rx], ['ry', target.ry]
    ], new ShapeAnchor(target.cx, target.cy));
  }

  public encode(shape: Shape): SvgShapeOutput {
    const target = this.requireShape(shape);
    return new SvgShapeOutput([['cx', target.cx], ['cy', target.cy], ['rx', target.rx], ['ry', target.ry]]);
  }

  public decode(input: SvgShapeInput): ShapeSpec {
    input.requireSupported(['id', 'cx', 'cy', 'rx', 'ry', 'fill', 'stroke', 'stroke-width']);
    return new EllipseSpec(input.id, input.requireNumber('cx'), input.requireNumber('cy'), input.requireNumber('rx'), input.requireNumber('ry'), input.style());
  }

  public validateImported(shape: Shape): void {
    this.requireShape(shape);
  }

  private requireShape(shape: Shape): Ellipse {
    if (!(shape instanceof Ellipse)) throw new DomainError('invalid shape instance: ellipse');
    return shape;
  }
}
