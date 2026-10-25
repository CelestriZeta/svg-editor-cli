import type { ShapeTree } from '../document/ShapeTree.js';
import type { Shape } from './Shape.js';
import type { ShapeLocation } from './ShapeLocation.js';
import { ShapeTreeChange } from './ShapeTreeChange.js';

export class ShapeInsertionChange extends ShapeTreeChange {
  public override readonly hasChanges = true;

  public constructor(
    private readonly tree: ShapeTree,
    private readonly shape: Shape,
    private readonly location: ShapeLocation
  ) {
    super();
  }

  public get insertedShape(): Shape {
    return this.shape;
  }

  public apply(): void {
    this.tree.adopt(
      this.shape,
      this.location.parent,
      this.location.index
    );
  }

  public revert(): void {
    this.tree.disown(this.shape);
  }
}
