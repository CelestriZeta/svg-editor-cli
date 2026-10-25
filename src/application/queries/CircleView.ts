import { ShapeView } from './ShapeView.js';
import type { ShapeViewVisitor } from './ShapeViewVisitor.js';

export class CircleView extends ShapeView {
  readonly #cx: number;
  readonly #cy: number;
  readonly #r: number;

  public constructor(
    id: string,
    cx: number,
    cy: number,
    r: number,
    fill?: string,
    stroke?: string,
    strokeWidth?: number
  ) {
    super(id, fill, stroke, strokeWidth);
    this.#cx = cx;
    this.#cy = cy;
    this.#r = r;
  }

  public get cx(): number {
    return this.#cx;
  }

  public get cy(): number {
    return this.#cy;
  }

  public get r(): number {
    return this.#r;
  }

  public override accept<T>(visitor: ShapeViewVisitor<T>): T {
    return visitor.visitCircle(this);
  }
}
