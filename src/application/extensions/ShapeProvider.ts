import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';

/** 初版创建规格契约；领域构造与 SVG 编解码在后续迁移步骤中接入。 */
export interface ShapeProvider {
  readonly name: string;
  readonly syntaxes: readonly string[];

  createSpec(id: string, parameters: readonly string[]): ShapeSpec;
}
