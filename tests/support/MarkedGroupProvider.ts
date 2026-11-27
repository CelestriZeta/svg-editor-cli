import type { ShapeProvider } from '../../src/application/extensions/ShapeProvider.js';
import { SvgContentKind } from '../../src/application/ports/SvgContentKind.js';
import type { SvgShapeInput } from '../../src/application/ports/SvgShapeInput.js';
import { SvgShapeOutput } from '../../src/application/ports/SvgShapeOutput.js';
import { GeometrySnapshot } from '../../src/application/queries/GeometrySnapshot.js';
import { MarkedGroupSpec } from './MarkedGroupSpec.js';

export class MarkedGroupProvider implements ShapeProvider {
  public readonly name = 'marked';
  public readonly svgTag = 'g';
  public readonly content = SvgContentKind.Children;
  public readonly syntaxes = Object.freeze(['create marked <id> [in <container-id>]']);

  public createSpec(id: string): MarkedGroupSpec {
    return new MarkedGroupSpec(id);
  }

  public project(): GeometrySnapshot {
    return GeometrySnapshot.empty();
  }

  public encode(): SvgShapeOutput {
    return new SvgShapeOutput([]);
  }

  public decode(input: SvgShapeInput): MarkedGroupSpec {
    input.requireSupported(['id']);
    return new MarkedGroupSpec(input.id);
  }

  public validateImported(): void {}
}
