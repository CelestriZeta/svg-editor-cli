import type { ShapeTree } from '../document/ShapeTree.js';
import { ChangeSetExecutor } from '../ChangeSetExecutor.js';
import type { ContainerShape } from './ContainerShape.js';
import type { Group } from './Group.js';
import type { Shape } from './Shape.js';
import type { ShapeLocation } from './ShapeLocation.js';
import { ShapeTreeChange } from './ShapeTreeChange.js';

export class ShapeDissolutionChange extends ShapeTreeChange {
  public override readonly hasChanges = true;
  readonly #children: readonly Shape[];

  public constructor(
    private readonly tree: ShapeTree,
    private readonly group: Group,
    private readonly parent: ContainerShape,
    private readonly location: ShapeLocation
  ) {
    super();
    this.#children = [...group.children];
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
}
