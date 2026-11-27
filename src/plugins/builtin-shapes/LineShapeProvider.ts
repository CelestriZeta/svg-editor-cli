import { Line } from '../../domain/shapes/Line.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import { GeometrySnapshot } from '../../application/queries/GeometrySnapshot.js';
import { ShapeAnchor } from '../../application/queries/ShapeAnchor.js';
import { SvgContentKind } from '../../application/ports/SvgContentKind.js';
import type { SvgShapeInput } from '../../application/ports/SvgShapeInput.js';
import { SvgShapeOutput } from '../../application/ports/SvgShapeOutput.js';
import { DomainError } from '../../domain/DomainError.js';
import { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';
import { LineSpec } from '../../domain/specs/LineSpec.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';
import type { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';

export class LineShapeProvider implements ShapeProvider {
  public readonly svgTag = 'line';
  public readonly content = SvgContentKind.Empty;
  public readonly name = 'line';
  public readonly syntaxes = Object.freeze(['create line <id> <x1> <y1> <x2> <y2> [stroke] [in <container-id>]']);

  public constructor(private readonly numbers: CommandNumberParser) {}

  public createSpec(id: string, parameters: readonly string[]): ShapeSpec {
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
      new ShapeStyle(undefined, stroke)
    );
  }
  public project(shape: Shape): GeometrySnapshot {
    const target = this.requireShape(shape);
    return GeometrySnapshot.segment(
      new ShapeAnchor(target.x1, target.y1), new ShapeAnchor(target.x2, target.y2));
  }

  public encode(shape: Shape): SvgShapeOutput {
    const target = this.requireShape(shape);
    return new SvgShapeOutput([['x1', target.x1], ['y1', target.y1], ['x2', target.x2], ['y2', target.y2]]);
  }

  public decode(input: SvgShapeInput): ShapeSpec {
    input.requireSupported(['id', 'x1', 'y1', 'x2', 'y2', 'fill', 'stroke', 'stroke-width']);
    return new LineSpec(input.id, input.requireNumber('x1'), input.requireNumber('y1'), input.requireNumber('x2'), input.requireNumber('y2'), input.style());
  }

  public validateImported(shape: Shape): void {
    this.requireShape(shape);
  }

  private requireShape(shape: Shape): Line {
    if (!(shape instanceof Line)) throw new DomainError('invalid shape instance: line');
    return shape;
  }
}
