import type { GeometrySnapshot } from './GeometrySnapshot.js';
import type { ShapeReference } from './ShapeReference.js';

export class ShapeSnapshot {
  readonly #children: readonly ShapeSnapshot[];

  public constructor(
    private readonly reference: ShapeReference,
    private readonly shapeGeometry: GeometrySnapshot,
    private readonly shapeFill?: string,
    private readonly shapeStroke?: string,
    private readonly shapeStrokeWidth?: number,
    private readonly parentReference?: ShapeReference,
    children: readonly ShapeSnapshot[] = []
  ) {
    this.#children = Object.freeze([...children]);
    Object.freeze(this);
  }

  public get type(): string {
    return this.reference.type;
  }

  public get id(): string {
    return this.reference.id;
  }

  public get geometry(): GeometrySnapshot {
    return this.shapeGeometry;
  }

  public get fill(): string | undefined {
    return this.shapeFill;
  }

  public get stroke(): string | undefined {
    return this.shapeStroke;
  }

  public get strokeWidth(): number | undefined {
    return this.shapeStrokeWidth;
  }

  public get parent(): ShapeReference | undefined {
    return this.parentReference;
  }

  public get children(): readonly ShapeSnapshot[] {
    return this.#children;
  }
}
