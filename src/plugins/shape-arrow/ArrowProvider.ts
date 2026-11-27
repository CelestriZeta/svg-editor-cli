import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';
import { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';
import { GeometrySnapshot } from '../../application/queries/GeometrySnapshot.js';
import { ShapeAnchor } from '../../application/queries/ShapeAnchor.js';
import { SvgContentKind } from '../../application/ports/SvgContentKind.js';
import type { SvgShapeInput } from '../../application/ports/SvgShapeInput.js';
import { SvgShapeOutput } from '../../application/ports/SvgShapeOutput.js';
import { DomainError } from '../../domain/DomainError.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';
import { LineSpec } from '../../domain/specs/LineSpec.js';
import { ArrowSpec } from './ArrowSpec.js';
import { ArrowShape } from './ArrowShape.js';

export class ArrowProvider implements ShapeProvider {
  public readonly name = 'arrow';
  public readonly svgTag = 'g';
  public readonly content = SvgContentKind.Children;
  public readonly syntaxes = Object.freeze([
    'create arrow <id> <x1> <y1> <x2> <y2> [stroke] [in <container-id>]'
  ]);

  public createSpec(id: string, parameters: readonly string[]): ArrowSpec {
    if (parameters.length !== 4 && parameters.length !== 5) {
      throw new DomainError('arrow requires x1, y1, x2 and y2');
    }
    const numbers = new CommandNumberParser();
    const x1 = numbers.parseShape('arrow', parameters[0], 'x1');
    const y1 = numbers.parseShape('arrow', parameters[1], 'y1');
    const x2 = numbers.parseShape('arrow', parameters[2], 'x2');
    const y2 = numbers.parseShape('arrow', parameters[3], 'y2');
    const dx = x2 - x1, dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    if (!Number.isFinite(length) || length === 0) {
      throw new DomainError('arrow endpoints must define a finite nonzero length');
    }
    const head = Math.min(20, length / 3);
    const ux = dx / length, uy = dy / length;
    const baseX = x2 - ux * head, baseY = y2 - uy * head;
    return new ArrowSpec(id, [
      new LineSpec(id + '-shaft', x1, y1, x2, y2),
      new LineSpec(id + '-head-left', x2, y2, baseX - uy * head / 2, baseY + ux * head / 2),
      new LineSpec(id + '-head-right', x2, y2, baseX + uy * head / 2, baseY - ux * head / 2)
    ], new ShapeStyle(undefined, parameters[4] ?? 'black'));
  }

  public project(shape: Shape): GeometrySnapshot {
    const shaft = this.requireShape(shape).shaft;
    return GeometrySnapshot.segment(new ShapeAnchor(shaft.x1, shaft.y1), new ShapeAnchor(shaft.x2, shaft.y2));
  }

  public encode(shape: Shape): SvgShapeOutput {
    this.requireShape(shape);
    return new SvgShapeOutput([]);
  }

  public decode(input: SvgShapeInput): ArrowSpec {
    input.requireSupported(['id', 'fill', 'stroke', 'stroke-width']);
    return new ArrowSpec(input.id, [], input.style());
  }

  public validateImported(shape: Shape): void { this.requireShape(shape); }

  private requireShape(shape: Shape): ArrowShape {
    if (!(shape instanceof ArrowShape)) throw new DomainError('invalid shape instance: arrow');
    return shape;
  }
}
