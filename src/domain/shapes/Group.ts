import { DomainError } from '../DomainError.js';
import type { ShapeRelations } from './ShapeRelations.js';
import type { GroupSpec } from '../specs/GroupSpec.js';
import { ContainerShape } from './ContainerShape.js';

export class Group extends ContainerShape {
  public constructor(spec: GroupSpec, tree: ShapeRelations) {
    super(spec.id, tree, spec.style);

    if (spec.type !== 'g') {
      throw new DomainError('invalid group specification');
    }
  }

  public override readonly type = 'g';

  public override assertCanUngroup(): void {}

}
