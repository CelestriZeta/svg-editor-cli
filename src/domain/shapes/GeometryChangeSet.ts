import { ShapeGeometryChange } from './ShapeGeometryChange.js';
import type { GeometryValueChange } from './GeometryValueChange.js';
import type { Shape } from './Shape.js';

export class GeometryChangeSet {
  readonly #changes: readonly ShapeGeometryChange[];

  public constructor(changes: readonly ShapeGeometryChange[]) {
    this.#changes = [...changes];
  }

  public static single(
    shape: Shape,
    values: readonly GeometryValueChange[]
  ): GeometryChangeSet {
    return new GeometryChangeSet([
      new ShapeGeometryChange(shape, values)
    ]);
  }

  public get changes(): readonly ShapeGeometryChange[] {
    return this.#changes;
  }

  public apply(): void {
    for (const change of this.#changes) {
      change.apply();
    }
  }

  public revert(): void {
    for (const change of this.#changes) {
      change.revert();
    }
  }
}
