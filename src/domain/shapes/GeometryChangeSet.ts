import { ShapeGeometryChange } from './ShapeGeometryChange.js';
import type { ChangeSet } from '../ChangeSet.js';
import { ChangeSetExecutor } from '../ChangeSetExecutor.js';
import type { GeometryValueChange } from './GeometryValueChange.js';
import type { Shape } from './Shape.js';

export class GeometryChangeSet implements ChangeSet {
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

  public get hasChanges(): boolean {
    return this.#changes.some((change) => change.hasChanges);
  }

  public apply(): void {
    ChangeSetExecutor.apply(this.#changes);
  }

  public revert(): void {
    ChangeSetExecutor.revert(this.#changes);
  }
}
