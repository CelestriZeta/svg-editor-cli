import { Group } from '../../domain/shapes/Group.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import { GeometrySnapshot } from '../../application/queries/GeometrySnapshot.js';
import { SvgContentKind } from '../../application/ports/SvgContentKind.js';
import type { SvgShapeInput } from '../../application/ports/SvgShapeInput.js';
import { SvgShapeOutput } from '../../application/ports/SvgShapeOutput.js';
import { DomainError } from '../../domain/DomainError.js';
import { GroupSpec } from '../../domain/specs/GroupSpec.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';

export class GroupShapeProvider implements ShapeProvider {
  public readonly svgTag = 'g';
  public readonly content = SvgContentKind.Children;
  public readonly name = 'g';
  public readonly syntaxes = Object.freeze(['create g <id> [in <container-id>]']);

  public createSpec(id: string, parameters: readonly string[]): ShapeSpec {
    if (parameters.length !== 0) {
      throw new DomainError('g does not accept parameters');
    }
    return new GroupSpec(id);
  }
  public project(shape: Shape): GeometrySnapshot {
    this.requireShape(shape);
    return GeometrySnapshot.empty();
  }

  public encode(shape: Shape): SvgShapeOutput {
    this.requireShape(shape);
    return new SvgShapeOutput([]);
  }

  public decode(input: SvgShapeInput): ShapeSpec {
    input.requireSupported(['id', 'fill', 'stroke', 'stroke-width']);
    return new GroupSpec(input.id, input.style());
  }

  public validateImported(shape: Shape): void {
    this.requireShape(shape);
  }

  private requireShape(shape: Shape): Group {
    if (!(shape instanceof Group)) throw new DomainError('invalid shape instance: g');
    return shape;
  }
}
