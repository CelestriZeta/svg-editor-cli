import type { ChangeSet } from '../ChangeSet.js';

export abstract class ShapeTreeChange implements ChangeSet {
  public abstract readonly hasChanges: boolean;

  public abstract apply(): void;

  public abstract revert(): void;
}
