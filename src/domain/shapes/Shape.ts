import { DomainError } from '../DomainError.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';

export abstract class Shape {
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

  public abstract accept<T>(visitor: ShapeVisitor<T>): T;
}
