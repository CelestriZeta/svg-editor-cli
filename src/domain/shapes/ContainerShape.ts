import { DomainError } from '../DomainError.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { Shape } from './Shape.js';
import type { ShapeGeometryChange } from './ShapeGeometryChange.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';
import {
  CONTAINER_APPEND,
  CONTAINER_REMOVE,
  SHAPE_SET_PARENT
} from './ShapeTreeMutation.js';

export abstract class ContainerShape extends Shape {
  readonly #children: Shape[] = [];

  public get children(): Iterable<Shape> {
    return this.#children.values();
  }

  public [CONTAINER_APPEND](shape: Shape): void {
    if (shape === this || this.isDescendantOf(shape)) {
      throw new DomainError(
        `cannot append a container to its own descendant: ${shape.id}`
      );
    }
    if (shape.parent !== undefined) {
      throw new DomainError(`shape already has a parent: ${shape.id}`);
    }

    this.#children.push(shape);
    shape[SHAPE_SET_PARENT](this);
  }

  public [CONTAINER_REMOVE](shape: Shape): void {
    const index = this.#children.indexOf(shape);
    if (index === -1) {
      throw new DomainError(`shape is not a child: ${shape.id}`);
    }

    this.#children.splice(index, 1);
    shape[SHAPE_SET_PARENT](undefined);
  }

  public override prepareMove(
    dx: number,
    dy: number
  ): GeometryChangeSet {
    Shape.requireMoveDelta(dx, dy);
    const changes: ShapeGeometryChange[] = [];
    for (const child of this.#children) {
      changes.push(...child.prepareMove(dx, dy).changes);
    }
    return new GeometryChangeSet(changes);
  }

  public override prepareScale(factor: number): GeometryChangeSet {
    Shape.requireScaleFactor(factor);
    const changes: ShapeGeometryChange[] = [];
    for (const child of this.#children) {
      changes.push(...child.prepareScale(factor).changes);
    }
    return new GeometryChangeSet(changes);
  }

  protected override setOwnAttribute(
    update: ShapeAttributeUpdate
  ): void {
    throw new DomainError(`unknown attribute: ${update.name}`);
  }

  private isDescendantOf(possibleAncestor: Shape): boolean {
    let current: Shape | undefined = this;

    while (current !== undefined) {
      if (current === possibleAncestor) {
        return true;
      }
      current = current.parent;
    }

    return false;
  }
}
