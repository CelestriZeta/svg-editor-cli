import { DomainError } from '../DomainError.js';

export class ShapeStyle {
  readonly #fill: string | undefined;
  readonly #stroke: string | undefined;
  readonly #strokeWidth: number | undefined;

  public constructor(
    fill?: string,
    stroke?: string,
    strokeWidth?: number
  ) {
    if (fill !== undefined && fill.length === 0) {
      throw new DomainError('fill must not be empty');
    }
    if (stroke !== undefined && stroke.length === 0) {
      throw new DomainError('stroke must not be empty');
    }
    if (
      strokeWidth !== undefined &&
      (!Number.isFinite(strokeWidth) || strokeWidth < 0)
    ) {
      throw new DomainError(
        'stroke-width must be a non-negative finite number'
      );
    }

    this.#fill = fill;
    this.#stroke = stroke;
    this.#strokeWidth = strokeWidth;
  }

  public get fill(): string | undefined {
    return this.#fill;
  }

  public get stroke(): string | undefined {
    return this.#stroke;
  }

  public get strokeWidth(): number | undefined {
    return this.#strokeWidth;
  }

  public withFill(fill: string | undefined): ShapeStyle {
    return new ShapeStyle(fill, this.#stroke, this.#strokeWidth);
  }

  public withStroke(stroke: string | undefined): ShapeStyle {
    return new ShapeStyle(this.#fill, stroke, this.#strokeWidth);
  }

  public withStrokeWidth(strokeWidth: number | undefined): ShapeStyle {
    return new ShapeStyle(this.#fill, this.#stroke, strokeWidth);
  }
}
