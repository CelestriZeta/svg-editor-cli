import { DomainError } from '../DomainError.js';
import type { RectSpec } from '../specs/RectSpec.js';
import { Shape } from './Shape.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';

export class Rect extends Shape {
  readonly #x: number;
  readonly #y: number;
  readonly #width: number;
  readonly #height: number;
  readonly #fill: string | undefined;

  public constructor(spec: RectSpec) {
    super(spec.id);

    if (spec.type !== 'rect') {
      throw new DomainError('invalid rect specification');
    }

    this.#x = spec.x;
    this.#y = spec.y;
    this.#width = spec.width;
    this.#height = spec.height;
    this.#fill = spec.fill;
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

  public override accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitRect(this);
  }
}
