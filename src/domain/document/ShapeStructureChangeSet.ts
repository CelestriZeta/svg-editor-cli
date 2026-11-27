import { CompositeChangeSet } from '../CompositeChangeSet.js';
import type { ShapeTreeChange } from '../shapes/ShapeTreeChange.js';
import type { ShapeTree } from './ShapeTree.js';
import { ShapeStructureCandidate } from './ShapeStructureCandidate.js';

/** 预演完整命令的最终结构；补偿仍由原有局部变更机制负责。 */
export class ShapeStructureChangeSet extends CompositeChangeSet<ShapeTreeChange> {
  public constructor(private readonly tree: ShapeTree, changes: readonly ShapeTreeChange[] = []) {
    super(changes);
    this.validate('apply');
  }

  public override apply(): void {
    this.validate('apply');
    super.apply();
  }

  public override revert(): void {
    this.validate('revert');
    super.revert();
  }

  private validate(direction: 'apply' | 'revert'): void {
    const candidate = new ShapeStructureCandidate(this.tree);
    const changes = direction === 'apply' ? this.changes : [...this.changes].reverse();
    for (const change of changes) change.preview(candidate, direction);
    candidate.validate();
  }
}
