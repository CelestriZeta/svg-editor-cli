import type { CanvasSize } from '../domain/document/CanvasSize.js';
import type { SvgElement } from './SvgElement.js';

export class SvgCanvas {
  readonly #rootChildren: readonly SvgElement[];

  public constructor(
    private readonly size: CanvasSize,
    rootChildren: readonly SvgElement[]
  ) {
    this.#rootChildren = Object.freeze([...rootChildren]);
  }

  public get width(): number {
    return this.size.width;
  }

  public get height(): number {
    return this.size.height;
  }

  public get children(): readonly SvgElement[] {
    return this.#rootChildren;
  }
}
