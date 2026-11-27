import { ContainerShape } from '../../src/domain/shapes/ContainerShape.js';
import type { ShapeRelations } from '../../src/domain/shapes/ShapeRelations.js';
import type { MarkedGroupSpec } from './MarkedGroupSpec.js';

export class MarkedGroup extends ContainerShape {
  public readonly type = 'marked';

  public constructor(spec: MarkedGroupSpec, relations: ShapeRelations) {
    super(spec.id, relations, spec.style);
  }
}
