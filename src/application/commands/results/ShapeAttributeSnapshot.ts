export enum ShapeAttributeSnapshotKind {
  Absent = 'absent',
  Number = 'number',
  Text = 'text'
}

export class ShapeAttributeSnapshot {
  private constructor(
    private readonly snapshotKind: ShapeAttributeSnapshotKind,
    private readonly snapshotNumber: number | undefined,
    private readonly snapshotText: string | undefined
  ) {}

  public static absent(): ShapeAttributeSnapshot {
    return new ShapeAttributeSnapshot(
      ShapeAttributeSnapshotKind.Absent,
      undefined,
      undefined
    );
  }

  public static number(value: number): ShapeAttributeSnapshot {
    return new ShapeAttributeSnapshot(
      ShapeAttributeSnapshotKind.Number,
      value,
      undefined
    );
  }

  public static text(value: string): ShapeAttributeSnapshot {
    return new ShapeAttributeSnapshot(
      ShapeAttributeSnapshotKind.Text,
      undefined,
      value
    );
  }

  public get kind(): ShapeAttributeSnapshotKind {
    return this.snapshotKind;
  }

  public get numericValue(): number {
    if (
      this.snapshotKind !== ShapeAttributeSnapshotKind.Number ||
      this.snapshotNumber === undefined
    ) {
      throw new Error('attribute snapshot does not contain a number');
    }
    return this.snapshotNumber;
  }

  public get textValue(): string {
    if (
      this.snapshotKind !== ShapeAttributeSnapshotKind.Text ||
      this.snapshotText === undefined
    ) {
      throw new Error('attribute snapshot does not contain text');
    }
    return this.snapshotText;
  }
}
