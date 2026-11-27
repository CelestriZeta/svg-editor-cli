import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import type { GeometrySnapshot } from '../queries/GeometrySnapshot.js';
import type { SvgContentKind } from '../ports/SvgContentKind.js';
import type { SvgShapeInput } from '../ports/SvgShapeInput.js';
import type { SvgShapeOutput } from '../ports/SvgShapeOutput.js';

/** CLI 输入在应用边界解码为可多态构造的领域规格；不接触内部树或 XML。 */
export interface ShapeProvider {
  readonly name: string;
  readonly syntaxes: readonly string[];
  readonly svgTag: string;
  readonly content: SvgContentKind;

  createSpec(id: string, parameters: readonly string[]): ShapeSpec;
  project(shape: Shape): GeometrySnapshot;
  encode(shape: Shape): SvgShapeOutput;
  decode(input: SvgShapeInput): ShapeSpec;
  validateImported(shape: Shape): void;
}
