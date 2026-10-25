import { DomainError } from '../DomainError.js';

export class CanvasSize {
  readonly #width: number;
  readonly #height: number;

  public constructor(width: number, height: number) {
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      throw new DomainError(
        'canvas width and height must be positive finite numbers'
      );
    }

    this.#width = width;
    this.#height = height;
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }
}
