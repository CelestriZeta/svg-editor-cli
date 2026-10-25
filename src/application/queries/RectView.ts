import { ShapeView } from './ShapeView.js';
import type { ShapeViewVisitor } from './ShapeViewVisitor.js';

export class RectView extends ShapeView {
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
    super(id, 'rect');
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
    this.#fill = fill;
  }

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

  public override accept<T>(visitor: ShapeViewVisitor<T>): T {
    return visitor.visitRect(this);
  }
}
