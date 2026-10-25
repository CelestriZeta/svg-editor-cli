import { DomainError } from '../DomainError.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';

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

  public withAttribute(
    update: ShapeAttributeUpdate
  ): ShapeStyle | undefined {
    switch (update.name) {
      case 'fill':
        return new ShapeStyle(
          update.textValue,
          this.#stroke,
          this.#strokeWidth
        );
      case 'stroke':
        return new ShapeStyle(
          this.#fill,
          update.textValue,
          this.#strokeWidth
        );
      case 'stroke-width': {
        const strokeWidth = update.numericValue;
        if (strokeWidth < 0) {
          throw new DomainError(
            'stroke-width must be a non-negative finite number'
          );
        }
        return new ShapeStyle(
          this.#fill,
          this.#stroke,
          strokeWidth
        );
      }
      default:
        return undefined;
    }
  }
}
