import { DomainError } from '../DomainError.js';
import { ShapeStyle } from '../shapes/ShapeStyle.js';
import { ShapeSpec } from './ShapeSpec.js';

export class EllipseSpec extends ShapeSpec {
  readonly #cx: number;
  readonly #cy: number;
  readonly #rx: number;
  readonly #ry: number;

  public constructor(
    id: string,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    fill?: string
  ) {
    super(id, new ShapeStyle(fill));

    if (![cx, cy, rx, ry].every(Number.isFinite)) {
      throw new DomainError('ellipse geometry must be finite numbers');
    }
    if (rx <= 0 || ry <= 0) {
      throw new DomainError('ellipse radii must be positive');
    }

    this.#cx = cx;
    this.#cy = cy;
    this.#rx = rx;
    this.#ry = ry;
  }

  public override readonly type = 'ellipse';

  public get cx(): number {
    return this.#cx;
  }

  public get cy(): number {
    return this.#cy;
  }

  public get rx(): number {
    return this.#rx;
  }

  public get ry(): number {
    return this.#ry;
  }
}
