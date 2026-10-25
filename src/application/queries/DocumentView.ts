import type { ShapeSnapshot } from './ShapeSnapshot.js';

export class DocumentView {
  readonly #width: number;
  readonly #height: number;
  readonly #children: readonly ShapeSnapshot[];

  public constructor(
    width: number,
    height: number,
    children: readonly ShapeSnapshot[]
  ) {
    this.#width = width;
    this.#height = height;
    this.#children = Object.freeze([...children]);
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

  public get children(): readonly ShapeSnapshot[] {
    return this.#children;
  }
}
