import { DomainError } from '../DomainError.js';
import type { GroupSpec } from '../specs/GroupSpec.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { ContainerShape } from './ContainerShape.js';

export class Group extends ContainerShape {
  public constructor(spec: GroupSpec) {
    super(spec.id, spec.style);

    if (spec.type !== 'g') {
      throw new DomainError('invalid group specification');
    }
  }

  public override readonly type = 'g';

  public override accept<T>(visitor: ShapeVisitor<T>): T {
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
