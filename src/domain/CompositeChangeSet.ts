import type { ChangeSet } from './ChangeSet.js';
import { ChangeSetExecutor } from './ChangeSetExecutor.js';

export class CompositeChangeSet<T extends ChangeSet = ChangeSet> implements ChangeSet {
  readonly #changes: readonly T[];

  public constructor(changes: readonly T[] = []) {
    this.#changes = Object.freeze([...changes]);
  }

  public get changes(): readonly T[] {
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
