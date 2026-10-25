import { ShapeView } from './ShapeView.js';
import type { ShapeViewVisitor } from './ShapeViewVisitor.js';

export class EllipseView extends ShapeView {
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
    fill?: string,
    stroke?: string,
    strokeWidth?: number
  ) {
    super(id, fill, stroke, strokeWidth);
    this.#cx = cx;
    this.#cy = cy;
    this.#rx = rx;
    this.#ry = ry;
  }

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

  public override accept<T>(visitor: ShapeViewVisitor<T>): T {
    return visitor.visitEllipse(this);
  }
}
