import { DomainError } from '../DomainError.js';
import type { ShapeTree } from '../document/ShapeTree.js';
import type { GroupSpec } from '../specs/GroupSpec.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { ContainerShape } from './ContainerShape.js';

export class Group extends ContainerShape {
  public constructor(spec: GroupSpec, tree: ShapeTree) {
    super(spec.id, tree, spec.style);

    if (spec.type !== 'g') {
      throw new DomainError('invalid group specification');
    }
  }

  public override readonly type = 'g';

  public override accept<T>(visitor: ShapeVisitor<T>): T {
    // 遍历由 Composite 统一控制；访问者可跳过子树，以支持只查看容器自身。
    if (!visitor.enterGroup(this)) {
      return visitor.leaveGroup(this, []);
    }

    const children: T[] = [];
    for (const child of this.children) {
      children.push(child.accept(visitor));
    }

    return visitor.leaveGroup(this, children);
  }
}
