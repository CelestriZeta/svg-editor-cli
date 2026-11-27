import { Rect } from '../../domain/shapes/Rect.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import { GeometrySnapshot } from '../../application/queries/GeometrySnapshot.js';
import { ShapeAnchor } from '../../application/queries/ShapeAnchor.js';
import { SvgContentKind } from '../../application/ports/SvgContentKind.js';
import type { SvgShapeInput } from '../../application/ports/SvgShapeInput.js';
import { SvgShapeOutput } from '../../application/ports/SvgShapeOutput.js';
import { DomainError } from '../../domain/DomainError.js';
import { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';
import { RectSpec } from '../../domain/specs/RectSpec.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';
import type { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';

export class RectShapeProvider implements ShapeProvider {
  public readonly svgTag = 'rect';
  public readonly content = SvgContentKind.Empty;
  public readonly name = 'rect';
  public readonly syntaxes = Object.freeze(['create rect <id> <x> <y> <w> <h> [fill] [in <container-id>]']);

  public constructor(private readonly numbers: CommandNumberParser) {}

  public createSpec(id: string, parameters: readonly string[]): ShapeSpec {
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
  public project(shape: Shape): GeometrySnapshot {
    const target = this.requireShape(shape);
    return GeometrySnapshot.named([
      ['x', target.x], ['y', target.y], ['width', target.width], ['height', target.height]
    ], new ShapeAnchor(target.x, target.y));
  }

  public encode(shape: Shape): SvgShapeOutput {
    const target = this.requireShape(shape);
    return new SvgShapeOutput([['x', target.x], ['y', target.y], ['width', target.width], ['height', target.height]]);
  }

  public decode(input: SvgShapeInput): ShapeSpec {
    input.requireSupported(['id', 'x', 'y', 'width', 'height', 'fill', 'stroke', 'stroke-width']);
    return new RectSpec(input.id, input.requireNumber('x'), input.requireNumber('y'), input.requireNumber('width'), input.requireNumber('height'), input.style());
  }

  public validateImported(shape: Shape): void {
    this.requireShape(shape);
  }

  private requireShape(shape: Shape): Rect {
    if (!(shape instanceof Rect)) throw new DomainError('invalid shape instance: rect');
    return shape;
  }
}
