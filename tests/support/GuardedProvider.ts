import type { ShapeProvider } from '../../src/application/extensions/ShapeProvider.js';
import { SvgContentKind } from '../../src/application/ports/SvgContentKind.js';
import type { SvgShapeInput } from '../../src/application/ports/SvgShapeInput.js';
import { SvgShapeOutput } from '../../src/application/ports/SvgShapeOutput.js';
import { GeometrySnapshot } from '../../src/application/queries/GeometrySnapshot.js';
import { GuardedSpec } from './GuardedSpec.js';

export class GuardedProvider implements ShapeProvider {
  public readonly name = 'guarded';
  public readonly svgTag = 'g';
  public readonly content = SvgContentKind.Children;
  public readonly syntaxes = Object.freeze(['create guarded <id> [in <container-id>]']);

  public createSpec(id: string): GuardedSpec { return new GuardedSpec(id); }
  public project(): GeometrySnapshot { return GeometrySnapshot.empty(); }
  public encode(): SvgShapeOutput { return new SvgShapeOutput([]); }

  public decode(input: SvgShapeInput): GuardedSpec {
    input.requireSupported(['id']);
    return new GuardedSpec(input.id);
  }

  public validateImported(): void {}
}
