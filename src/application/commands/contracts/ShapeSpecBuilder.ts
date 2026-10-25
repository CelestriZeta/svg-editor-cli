import type { ShapeSpec } from '../../../domain/specs/ShapeSpec.js';

export interface ShapeSpecBuilder {
  create(id: string, parameters: readonly string[]): ShapeSpec;
}
