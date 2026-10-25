import type { ShapeViewVisitor } from './ShapeViewVisitor.js';

export abstract class ShapeView {
  readonly #id: string;
  readonly #type: string;

  protected constructor(id: string, type: string) {
    this.#id = id;
    this.#type = type;
  }

  public get id(): string {
    return this.#id;
  }

  public get type(): string {
    return this.#type;
  }

  public abstract accept<T>(visitor: ShapeViewVisitor<T>): T;
}
