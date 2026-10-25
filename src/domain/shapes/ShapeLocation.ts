import { DomainError } from '../DomainError.js';
import type { ContainerShape } from './ContainerShape.js';

export class ShapeLocation {
  readonly #parent: ContainerShape | undefined;
  readonly #index: number;

  public constructor(parent: ContainerShape | undefined, index: number) {
    if (!Number.isSafeInteger(index) || index < 0) {
      throw new DomainError('shape location index must be a non-negative integer');
    }

    this.#parent = parent;
    this.#index = index;
  }

  public get parent(): ContainerShape | undefined {
    return this.#parent;
  }

  public get index(): number {
    return this.#index;
  }
}
