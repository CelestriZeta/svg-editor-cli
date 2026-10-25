import type { ShapeView } from './ShapeView.js';

export class DocumentView {
  readonly #width: number;
  readonly #height: number;
  readonly #children: readonly ShapeView[];

  public constructor(
    width: number,
    height: number,
    children: readonly ShapeView[]
  ) {
    this.#width = width;
    this.#height = height;
    this.#children = [...children];
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

  public get children(): readonly ShapeView[] {
    return this.#children;
  }
}
