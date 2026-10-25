import { DomainError } from '../DomainError.js';

export abstract class ShapeSpec {
  readonly #id: string;

  protected constructor(id: string) {
    if (id.trim().length === 0) {
      throw new DomainError('shape id must not be empty');
    }

    this.#id = id;
  }

  public get id(): string {
    return this.#id;
  }

  public abstract readonly type: string;
}
