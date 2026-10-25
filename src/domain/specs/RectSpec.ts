import { DomainError } from '../DomainError.js';
import { ShapeStyle } from '../shapes/ShapeStyle.js';
import { ShapeSpec } from './ShapeSpec.js';

export class RectSpec extends ShapeSpec {
  readonly #x: number;
  readonly #y: number;
  readonly #width: number;
  readonly #height: number;
  public constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string
  ) {
    super(id, new ShapeStyle(fill));

    if (![x, y, width, height].every(Number.isFinite)) {
      throw new DomainError('rect geometry must be finite numbers');
    }
    if (width <= 0 || height <= 0) {
      throw new DomainError('rect width and height must be positive');
    }
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
  }

  public override readonly type = 'rect';

  public get x(): number {
    return this.#x;
  }

  public get y(): number {
    return this.#y;
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

}
