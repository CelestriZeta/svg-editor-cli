import { ShapeView } from './ShapeView.js';
import type { ShapeViewVisitor } from './ShapeViewVisitor.js';

export class TextView extends ShapeView {
  readonly #x: number;
  readonly #y: number;
  readonly #content: string;

  public constructor(
    id: string,
    x: number,
    y: number,
    content: string,
    fill?: string,
    stroke?: string,
    strokeWidth?: number
  ) {
    super(id, fill, stroke, strokeWidth);
    this.#x = x;
    this.#y = y;
    this.#content = content;
  }

  public get x(): number {
    return this.#x;
  }

  public get y(): number {
    return this.#y;
  }

  public get content(): string {
    return this.#content;
  }

  public override accept<T>(visitor: ShapeViewVisitor<T>): T {
    return visitor.visitText(this);
  }
}
