import type { Shape } from './Shape.js';
import type { ContainerShape } from './ContainerShape.js';

export interface ShapeRelations {
  parentOf(shape: Shape): ContainerShape | undefined;
  childrenOf(parent: ContainerShape): Iterable<Shape>;
}
