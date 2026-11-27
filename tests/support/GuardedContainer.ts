import { ContainerShape } from '../../src/domain/shapes/ContainerShape.js';
import type { ShapeRelations } from '../../src/domain/shapes/ShapeRelations.js';
import { Rect } from '../../src/domain/shapes/Rect.js';
import { DomainError } from '../../src/domain/DomainError.js';

export class GuardedContainer extends ContainerShape {
  public readonly type = 'guarded';

  public constructor(id: string, relations: ShapeRelations) {
    super(id, relations);
  }

  public override validateStructure(relations: ShapeRelations): void {
    const core = [...relations.childrenOf(this)].find((child) => child.id === this.id + '-core');
    if (!(core instanceof Rect)) throw new DomainError('required core missing: ' + this.id);
  }
}
