import { DomainError } from '../DomainError.js';
import { ShapeAttributeValue } from './ShapeAttributeValue.js';

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

  public withValue(
    name: string,
    value: ShapeAttributeValue
  ): ShapeStyle | undefined {
    switch (name) {
      case 'fill':
        return new ShapeStyle(
          value.isAbsent ? undefined : value.textValue,
          this.#stroke,
          this.#strokeWidth
        );
      case 'stroke':
        return new ShapeStyle(
          this.#fill,
          value.isAbsent ? undefined : value.textValue,
          this.#strokeWidth
        );
      case 'stroke-width':
        return new ShapeStyle(
          this.#fill,
          this.#stroke,
          value.isAbsent ? undefined : value.numericValue
        );
      default:
        return undefined;
    }
  }

}
