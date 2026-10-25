import { ShapeTreeChange } from '../../src/domain/shapes/ShapeTreeChange.js';

export class RecordingShapeTreeChange extends ShapeTreeChange {
  public override readonly hasChanges = true;

  public constructor(
    private readonly onApply: () => void,
    private readonly onRevert: () => void
  ) {
    super();
  }

  public apply(): void {
    this.onApply();
  }

  public revert(): void {
    this.onRevert();
  }
}
