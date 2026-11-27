import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { Shape } from './Shape.js';
import type { ShapeAttributeSlot } from './ShapeAttributeSlot.js';
import type { ShapeGeometryChange } from './ShapeGeometryChange.js';

export abstract class ContainerShape extends Shape {
  public override accept<T>(visitor: ShapeVisitor<T>): T {
    // 遍历由 Composite 统一控制；访问者可跳过子树，以支持只查看容器自身。
    if (!visitor.enterContainer(this)) {
      return visitor.leaveContainer(this, []);
    }

    const children: T[] = [];
    for (const child of this.children) {
      children.push(child.accept(visitor));
    }

    return visitor.leaveContainer(this, children);
  }

  public get children(): Iterable<Shape> {
    return this.childrenOf(this);
  }

  public override prepareMove(
    dx: number,
    dy: number
  ): GeometryChangeSet {
    Shape.requireMoveDelta(dx, dy);
    // 先递归算完所有后代的候选值，避免后续节点溢出时前面的节点已被修改。
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
