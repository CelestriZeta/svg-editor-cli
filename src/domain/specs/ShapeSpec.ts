import { DomainError } from '../DomainError.js';
import { ShapeStyle } from '../shapes/ShapeStyle.js';
import type { Shape } from '../shapes/Shape.js';
import type { ShapeRelations } from '../shapes/ShapeRelations.js';

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
  public abstract create(relations: ShapeRelations): Shape;

  public get children(): readonly ShapeSpec[] {
    return Object.freeze([]);
  }
}
