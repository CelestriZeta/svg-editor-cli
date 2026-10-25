import { ShapeAnchor } from './ShapeAnchor.js';

export type GeometryAttribute =
  | 'x' | 'y' | 'width' | 'height'
  | 'cx' | 'cy' | 'r' | 'rx' | 'ry'
  | 'x1' | 'y1' | 'x2' | 'y2';
export type NumericGeometry = readonly (readonly [GeometryAttribute, number])[];

export class GeometrySnapshot {
  readonly #attributes: NumericGeometry;

  private constructor(
    attributes: NumericGeometry,
    private readonly position?: ShapeAnchor,
    private readonly endPosition?: ShapeAnchor,
    private readonly textContent?: string
  ) {
    this.#attributes = Object.freeze(
      attributes.map(([name, value]) => Object.freeze([name, value] as const))
    );
    Object.freeze(this);
  }

  public static empty(): GeometrySnapshot {
    return new GeometrySnapshot([]);
  }

  public static named(
    attributes: NumericGeometry,
    anchor: ShapeAnchor
  ): GeometrySnapshot {
    return new GeometrySnapshot(attributes, anchor);
  }

  public static segment(start: ShapeAnchor, end: ShapeAnchor): GeometrySnapshot {
    return new GeometrySnapshot(
      [['x1', start.x], ['y1', start.y], ['x2', end.x], ['y2', end.y]],
      start,
      end
    );
  }

  public static text(position: ShapeAnchor, content: string): GeometrySnapshot {
    return new GeometrySnapshot(
      [['x', position.x], ['y', position.y]],
      position,
      undefined,
      content
    );
  }

  public get attributes(): NumericGeometry {
    return this.#attributes;
  }

  public get anchor(): ShapeAnchor | undefined {
    return this.position;
  }

  public get end(): ShapeAnchor | undefined {
    return this.endPosition;
  }

  public get content(): string | undefined {
    return this.textContent;
  }
}
