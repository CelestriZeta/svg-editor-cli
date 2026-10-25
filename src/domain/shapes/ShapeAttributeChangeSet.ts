import type { ChangeSet } from '../ChangeSet.js';
import { ChangeSetExecutor } from '../ChangeSetExecutor.js';
import type { ShapeAttributeChange } from './ShapeAttributeChange.js';

export class ShapeAttributeChangeSet implements ChangeSet {
  readonly #changes: readonly ShapeAttributeChange[];

  public constructor(changes: readonly ShapeAttributeChange[]) {
    this.#changes = [...changes];
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
