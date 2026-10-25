import { DomainError } from '../DomainError.js';
import { ShapeStyle } from '../shapes/ShapeStyle.js';
import { ShapeSpec } from './ShapeSpec.js';

export class LineSpec extends ShapeSpec {
  readonly #x1: number;
  readonly #y1: number;
  readonly #x2: number;
  readonly #y2: number;

  public constructor(
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke?: string
  ) {
    super(id, new ShapeStyle(undefined, stroke));

    if (![x1, y1, x2, y2].every(Number.isFinite)) {
      throw new DomainError('line geometry must be finite numbers');
    }

    this.#x1 = x1;
    this.#y1 = y1;
    this.#x2 = x2;
    this.#y2 = y2;
  }

  public override readonly type = 'line';

  public get x1(): number {
    return this.#x1;
  }

  public get y1(): number {
    return this.#y1;
  }

  public get x2(): number {
    return this.#x2;
  }

  public get y2(): number {
    return this.#y2;
  }
}
