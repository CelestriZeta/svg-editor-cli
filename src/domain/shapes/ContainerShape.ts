import { DomainError } from '../DomainError.js';
import type { ShapeTree } from '../document/ShapeTree.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { Shape } from './Shape.js';
import type { ShapeAttributeSlot } from './ShapeAttributeSlot.js';
import type { ShapeGeometryChange } from './ShapeGeometryChange.js';

export abstract class ContainerShape extends Shape {
  public get children(): Iterable<Shape> {
    return this.childrenOf(this);
  }

  public override prepareMove(
    dx: number,
    dy: number
  ): GeometryChangeSet {
    Shape.requireMoveDelta(dx, dy);
    const changes: ShapeGeometryChange[] = [];
    for (const child of this.children) {
      changes.push(...child.prepareMove(dx, dy).changes);
    }
    return new GeometryChangeSet(changes);
  }

  public override prepareScale(factor: number): GeometryChangeSet {
    Shape.requireScaleFactor(factor);
    const changes: ShapeGeometryChange[] = [];
    for (const child of this.children) {
      changes.push(...child.prepareScale(factor).changes);
    }
    return new GeometryChangeSet(changes);
  }

  protected override ownAttributeSlot(
    _name: string
  ): ShapeAttributeSlot | undefined {
    return undefined;
  }
}
