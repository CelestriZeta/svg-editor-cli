import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';

/** CLI 输入在应用边界解码为可多态构造的领域规格；不接触内部树或 XML。 */
export interface ShapeProvider {
  readonly name: string;
  readonly syntaxes: readonly string[];

  createSpec(id: string, parameters: readonly string[]): ShapeSpec;
}
