import { Text } from '../../domain/shapes/Text.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import { GeometrySnapshot } from '../../application/queries/GeometrySnapshot.js';
import { ShapeAnchor } from '../../application/queries/ShapeAnchor.js';
import { SvgContentKind } from '../../application/ports/SvgContentKind.js';
import type { SvgShapeInput } from '../../application/ports/SvgShapeInput.js';
import { SvgShapeOutput } from '../../application/ports/SvgShapeOutput.js';
import { DomainError } from '../../domain/DomainError.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import { TextSpec } from '../../domain/specs/TextSpec.js';
import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';
import type { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';

export class TextShapeProvider implements ShapeProvider {
  public readonly svgTag = 'text';
  public readonly content = SvgContentKind.Text;
  public readonly name = 'text';
  public readonly syntaxes = Object.freeze(['create text <id> <x> <y> "content" [in <container-id>]']);

  public constructor(private readonly numbers: CommandNumberParser) {}

  public createSpec(id: string, parameters: readonly string[]): ShapeSpec {
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
  public project(shape: Shape): GeometrySnapshot {
    const target = this.requireShape(shape);
    return GeometrySnapshot.text(new ShapeAnchor(target.x, target.y), target.content);
  }

  public encode(shape: Shape): SvgShapeOutput {
    const target = this.requireShape(shape);
    return new SvgShapeOutput([['x', target.x], ['y', target.y]], target.content);
  }

  public decode(input: SvgShapeInput): ShapeSpec {
    input.requireSupported(['id', 'x', 'y', 'fill', 'stroke', 'stroke-width']);
    return new TextSpec(input.id, input.requireNumber('x'), input.requireNumber('y'), input.text, input.style());
  }

  public validateImported(shape: Shape): void {
    this.requireShape(shape);
  }

  private requireShape(shape: Shape): Text {
    if (!(shape instanceof Text)) throw new DomainError('invalid shape instance: text');
    return shape;
  }
}
