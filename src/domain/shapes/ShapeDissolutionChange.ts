import type { ShapeTree } from '../document/ShapeTree.js';
import { ChangeSetExecutor } from '../ChangeSetExecutor.js';
import type { ContainerShape } from './ContainerShape.js';
import type { ShapeStructureCandidate } from '../document/ShapeStructureCandidate.js';
import type { Shape } from './Shape.js';
import type { ShapeLocation } from './ShapeLocation.js';
import { ShapeTreeChange } from './ShapeTreeChange.js';
import { DomainError } from '../DomainError.js';

export class ShapeDissolutionChange extends ShapeTreeChange {
  public override readonly hasChanges = true;
  readonly #children: readonly Shape[];

  public constructor(
    private readonly tree: ShapeTree,
    private readonly group: ContainerShape,
    private readonly parent: ContainerShape,
    private readonly location: ShapeLocation
  ) {
    super();
    this.#children = Object.freeze([...group.children]);
  }

  public apply(): void {
    let moved = 0;
    try {
      this.#children.forEach((child, index) => {
        this.tree.relocate(
          child,
          this.parent,
          this.location.index + index
        );
        moved += 1;
      });
      this.tree.disown(this.group);
    } catch (error) {
      const rollbackActions = Array.from({ length: moved }, (_, offset) => {
        const index = moved - 1 - offset;
        return () => {
          const child = this.#children[index];
          if (child !== undefined) {
            this.tree.relocate(child, this.group, index);
          }
        };
      });
      ChangeSetExecutor.rollback(rollbackActions, error);
    }
  }

  public revert(): void {
    this.tree.adopt(
      this.group,
      this.location.parent,
      this.location.index
    );

    let moved = 0;
    try {
      this.#children.forEach((child, index) => {
        this.tree.relocate(child, this.group, index);
        moved += 1;
      });
    } catch (error) {
      const rollbackActions: (() => void)[] = Array.from(
        { length: moved },
        (_, offset) => {
          const index = moved - 1 - offset;
          return () => {
            const child = this.#children[index];
            if (child !== undefined) {
              this.tree.relocate(
                child,
                this.parent,
                this.location.index + index
              );
            }
          };
        }
      );
      rollbackActions.push(() => this.tree.disown(this.group));
      ChangeSetExecutor.rollback(rollbackActions, error);
    }
  }

  public preview(candidate: ShapeStructureCandidate, direction: 'apply' | 'revert'): void {
    if (direction === 'apply') {
      this.group.assertCanUngroup();
      const current = [...candidate.childrenOf(this.group)];
      if (candidate.parentOf(this.group) !== this.location.parent ||
          candidate.indexOf(this.group) !== this.location.index ||
          current.length !== this.#children.length ||
          current.some((child, index) => child !== this.#children[index])) {
        throw new DomainError(`container structure changed: ${this.group.id}`);
      }
      this.#children.forEach((child, index) => candidate.relocate(child, this.parent, this.location.index + index));
      candidate.remove(this.group);
    } else {
      candidate.insert(this.group, this.location.parent, this.location.index);
      this.#children.forEach((child, index) => candidate.relocate(child, this.group, index));
    }
  }
}
