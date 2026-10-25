import { DomainError } from '../DomainError.js';
import { ShapeStyle } from '../shapes/ShapeStyle.js';

export abstract class ShapeSpec {
  readonly #id: string;
  readonly #style: ShapeStyle;

  protected constructor(id: string, style = new ShapeStyle()) {
    if (id.trim().length === 0) {
      throw new DomainError('shape id must not be empty');
    }

    this.#id = id;
    this.#style = style;
  }

  public get id(): string {
    return this.#id;
  }

  public get style(): ShapeStyle {
    return this.#style;
  }

  public abstract readonly type: string;
}
