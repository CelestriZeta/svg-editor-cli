import { DomainError } from '../DomainError.js';
import { ShapeSpec } from './ShapeSpec.js';

export class RectSpec extends ShapeSpec {
  readonly #x: number;
  readonly #y: number;
  readonly #width: number;
  readonly #height: number;
  readonly #fill: string | undefined;

  public constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string
  ) {
    super(id);

    if (![x, y, width, height].every(Number.isFinite)) {
      throw new DomainError('rect geometry must be finite numbers');
    }
    if (width <= 0 || height <= 0) {
      throw new DomainError('rect width and height must be positive');
    }
    if (fill !== undefined && fill.length === 0) {
      throw new DomainError('rect fill must not be empty');
    }

    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
    this.#fill = fill;
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

  public get fill(): string | undefined {
    return this.#fill;
  }
}
