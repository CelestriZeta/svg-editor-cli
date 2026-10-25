export class ShapeAnchor {
  public constructor(
    private readonly anchorX: number,
    private readonly anchorY: number
  ) {}

  public get x(): number {
    return this.anchorX;
  }

  public get y(): number {
    return this.anchorY;
  }
}
