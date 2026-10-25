import { DomainError } from '../DomainError.js';
import { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';

export class GeometryValueChange {
  readonly #attribute: string;
  readonly #before: number;
  readonly #after: number;

  public constructor(attribute: string, before: number, after: number) {
    if (attribute.trim().length === 0) {
      throw new DomainError('geometry attribute must not be empty');
    }
    if (!Number.isFinite(before) || !Number.isFinite(after)) {
      throw new DomainError(
        `${attribute} geometry change must be finite numbers`
      );
    }

    this.#attribute = attribute;
    this.#before = before;
    this.#after = after;
  }

  public get attribute(): string {
    return this.#attribute;
  }

  public get before(): number {
    return this.#before;
  }

  public get after(): number {
    return this.#after;
  }

  public beforeUpdate(): ShapeAttributeUpdate {
    return ShapeAttributeUpdate.number(this.#attribute, this.#before);
  }

  public afterUpdate(): ShapeAttributeUpdate {
    return ShapeAttributeUpdate.number(this.#attribute, this.#after);
  }
}
