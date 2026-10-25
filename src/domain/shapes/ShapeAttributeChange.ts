import type { ChangeSet } from '../ChangeSet.js';
import type { ShapeAttributeSlot } from './ShapeAttributeSlot.js';
import type { ShapeAttributeValue } from './ShapeAttributeValue.js';

export class ShapeAttributeChange implements ChangeSet {
  public constructor(
    private readonly slot: ShapeAttributeSlot,
    private readonly before: ShapeAttributeValue,
    private readonly after: ShapeAttributeValue
  ) {}

  public get hasChanges(): boolean {
    return !this.before.equals(this.after);
  }

  public apply(): void {
    this.slot.write(this.after);
  }

  public revert(): void {
    this.slot.write(this.before);
  }
}
