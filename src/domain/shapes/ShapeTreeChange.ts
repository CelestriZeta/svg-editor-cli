import type { ChangeSet } from '../ChangeSet.js';
import type { ShapeStructureCandidate } from '../document/ShapeStructureCandidate.js';

export abstract class ShapeTreeChange implements ChangeSet {
  public abstract readonly hasChanges: boolean;

  public abstract apply(): void;

  public abstract revert(): void;
  public abstract preview(candidate: ShapeStructureCandidate, direction: 'apply' | 'revert'): void;
}
