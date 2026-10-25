import { ShapeView } from './ShapeView.js';
import type { ShapeViewVisitor } from './ShapeViewVisitor.js';

export class LineView extends ShapeView {
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
    fill?: string,
    stroke?: string,
    strokeWidth?: number
  ) {
    super(id, fill, stroke, strokeWidth);
    this.#x1 = x1;
    this.#y1 = y1;
    this.#x2 = x2;
    this.#y2 = y2;
  }

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

  public override accept<T>(visitor: ShapeViewVisitor<T>): T {
    return visitor.visitLine(this);
  }
}
