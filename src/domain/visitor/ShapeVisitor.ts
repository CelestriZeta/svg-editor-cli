import type { Shape } from '../shapes/Shape.js';
import type { ContainerShape } from '../shapes/ContainerShape.js';

export abstract class ShapeVisitor<T> {
  public abstract enterContainer(container: ContainerShape): boolean;
  public abstract leaveContainer(container: ContainerShape, children: readonly T[]): T;
  public abstract visitShape(shape: Shape): T;
}
