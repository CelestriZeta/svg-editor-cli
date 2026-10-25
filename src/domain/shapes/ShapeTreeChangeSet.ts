import type { ChangeSet } from '../ChangeSet.js';
import { ChangeSetExecutor } from '../ChangeSetExecutor.js';
import type { ShapeTreeChange } from './ShapeTreeChange.js';

export class ShapeTreeChangeSet implements ChangeSet {
  readonly #changes: readonly ShapeTreeChange[];

  public constructor(changes: readonly ShapeTreeChange[] = []) {
    this.#changes = [...changes];
  }

  public get changes(): readonly ShapeTreeChange[] {
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
