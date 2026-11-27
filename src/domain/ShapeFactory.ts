import { DomainError } from './DomainError.js';
import { Shape } from './shapes/Shape.js';
import type { ShapeRelations } from './shapes/ShapeRelations.js';
import type { ShapeSpec } from './specs/ShapeSpec.js';
import { ShapeSubtree } from './document/ShapeSubtree.js';

export class ShapeFactory {
  public createSubtree(spec: ShapeSpec, relations: ShapeRelations): ShapeSubtree {
    return new ShapeSubtree(spec, relations, (node, view) => this.create(node, view));
  }

  public create(spec: ShapeSpec, relations: ShapeRelations): Shape {
    const view: ShapeRelations = Object.freeze({
      parentOf: (shape) => relations.parentOf(shape),
      childrenOf: (container) => relations.childrenOf(container)
    } satisfies ShapeRelations);
    const shape = spec.create(view);
    if (!(shape instanceof Shape) || shape.id !== spec.id || shape.type !== spec.type) {
      throw new DomainError(`invalid shape specification: ${spec.type}`);
    }
    return shape;
  }
}
