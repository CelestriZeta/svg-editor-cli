import type { ChangeSet } from '../ChangeSet.js';
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
    for (const value of this.#values) {
      this.#shape.set(value.afterUpdate());
    }
  }

  public revert(): void {
    for (const value of this.#values) {
      this.#shape.set(value.beforeUpdate());
    }
  }
}
