import type { ShapeTree } from '../document/ShapeTree.js';
import type { Shape } from './Shape.js';
import type { ShapeLocation } from './ShapeLocation.js';
import { ShapeTreeChange } from './ShapeTreeChange.js';
import type { ShapeSubtree } from '../document/ShapeSubtree.js';
import type { ShapeStructureCandidate } from '../document/ShapeStructureCandidate.js';

export class ShapeInsertionChange extends ShapeTreeChange {
  public override readonly hasChanges = true;

  public constructor(
    private readonly tree: ShapeTree,
    private readonly shape: Shape,
    private readonly location: ShapeLocation,
    private subtree?: ShapeSubtree
  ) {
    super();
  }

  public get insertedShape(): Shape {
    return this.shape;
  }

  public apply(): void {
    if (this.subtree !== undefined) {
      this.tree.adoptSubtree(this.subtree, this.location.parent, this.location.index);
      // 首次安装后，重做沿用图形当前保留的关系，不再覆盖为创建时的副本。
      this.subtree = undefined;
      return;
    }
    this.tree.adopt(
      this.shape,
      this.location.parent,
      this.location.index
    );
  }

  public revert(): void {
    this.tree.disown(this.shape);
  }

  public preview(candidate: ShapeStructureCandidate, direction: 'apply' | 'revert'): void {
    if (direction === 'apply') candidate.insert(this.shape, this.location.parent, this.location.index);
    else candidate.remove(this.shape);
  }
}
