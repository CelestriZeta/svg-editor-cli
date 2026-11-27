import type { Shape } from '../shapes/Shape.js';
import type { ContainerShape } from '../shapes/ContainerShape.js';
import { ShapeVisitor } from './ShapeVisitor.js';

export class ShapeCollector extends ShapeVisitor<void> {
  readonly #shapes: Shape[] = [];

  public collect(shape: Shape): readonly Shape[] {
    this.#shapes.length = 0;
    shape.accept(this);
    return [...this.#shapes];
  }
  public enterContainer(container: ContainerShape): boolean {
    this.#shapes.push(container);
    return true;
  }

  public leaveContainer(): void {}

  public visitShape(shape: Shape): void {
    this.#shapes.push(shape);
  }
}
