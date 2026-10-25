import type { ShapeTree } from '../document/ShapeTree.js';
import type { Shape } from './Shape.js';
import type { ShapeLocation } from './ShapeLocation.js';
import { ShapeTreeChange } from './ShapeTreeChange.js';

export class ShapeRemovalChange extends ShapeTreeChange {
  public override readonly hasChanges = true;

  public constructor(
    private readonly tree: ShapeTree,
    private readonly shape: Shape,
    private readonly location: ShapeLocation
  ) {
    super();
  }

  public apply(): void {
    this.tree.disown(this.shape);
  }

  public revert(): void {
    this.tree.adopt(
      this.shape,
      this.location.parent,
      this.location.index
    );
  }
}
