import type { ChangeSet } from '../ChangeSet.js';
import { ChangeSetExecutor } from '../ChangeSetExecutor.js';
import type { Shape } from './Shape.js';
import type { GeometryValueChange } from './GeometryValueChange.js';

export class ShapeGeometryChange implements ChangeSet {
  readonly #shape: Shape;
  readonly #values: readonly GeometryValueChange[];

  public constructor(
    shape: Shape,
    values: readonly GeometryValueChange[]
  ) {
    this.#shape = shape;
    this.#values = [...values];
  }

  public get shape(): Shape {
    return this.#shape;
  }

  public get values(): readonly GeometryValueChange[] {
    return this.#values;
  }

  public get hasChanges(): boolean {
    return this.#values.some((value) => value.before !== value.after);
  }

  public apply(): void {
    this.write('after');
  }

  public revert(): void {
    this.write('before');
  }

  private write(direction: 'before' | 'after'): void {
    const applied: GeometryValueChange[] = [];
    try {
      for (const value of this.#values) {
        const update =
          direction === 'after'
            ? value.afterUpdate()
            : value.beforeUpdate();
        this.#shape.set(update);
        applied.push(value);
      }
    } catch (error) {
      const rollbackDirection = direction === 'after' ? 'before' : 'after';
      ChangeSetExecutor.rollback(
        applied.reverse().map((value) => () => {
          const update =
            rollbackDirection === 'after'
              ? value.afterUpdate()
              : value.beforeUpdate();
          this.#shape.set(update);
        }),
        error
      );
    }
  }
}
