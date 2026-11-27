import type { ShapeTree } from '../document/ShapeTree.js';
import type { Shape } from './Shape.js';
import type { ShapeLocation } from './ShapeLocation.js';
import { ShapeTreeChange } from './ShapeTreeChange.js';
import type { ShapeStructureCandidate } from '../document/ShapeStructureCandidate.js';

export class ShapeRelocationChange extends ShapeTreeChange {
  public override readonly hasChanges = true;

  public constructor(
    private readonly tree: ShapeTree,
    private readonly shape: Shape,
    private readonly before: ShapeLocation,
    private readonly after: ShapeLocation
  ) {
    super();
  }

  public apply(): void {
    this.tree.relocate(
      this.shape,
      this.after.parent,
      this.after.index
    );
  }

  public revert(): void {
    this.tree.relocate(
      this.shape,
      this.before.parent,
      this.before.index
    );
  }

  public preview(candidate: ShapeStructureCandidate, direction: 'apply' | 'revert'): void {
    const target = direction === 'apply' ? this.after : this.before;
    candidate.relocate(this.shape, target.parent, target.index);
  }
}
