import { DomainError } from '../DomainError.js';
import { ShapeStyle } from '../shapes/ShapeStyle.js';
import { ShapeSpec } from './ShapeSpec.js';

export class CircleSpec extends ShapeSpec {
  readonly #cx: number;
  readonly #cy: number;
  readonly #r: number;

  public constructor(
    id: string,
    cx: number,
    cy: number,
    r: number,
    fill?: string
  ) {
    super(id, new ShapeStyle(fill));

    if (![cx, cy, r].every(Number.isFinite)) {
      throw new DomainError('circle geometry must be finite numbers');
    }
    if (r <= 0) {
      throw new DomainError('circle radius must be positive');
    }

    this.#cx = cx;
    this.#cy = cy;
    this.#r = r;
  }

  public override readonly type = 'circle';

  public get cx(): number {
    return this.#cx;
  }

  public get cy(): number {
    return this.#cy;
  }

  public get r(): number {
    return this.#r;
  }
}
