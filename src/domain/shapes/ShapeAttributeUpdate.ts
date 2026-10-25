import { DomainError } from '../DomainError.js';
import { ShapeAttributeValueKind } from './ShapeAttributeValueKind.js';

export class ShapeAttributeUpdate {
  readonly #name: string;
  readonly #numberValue: number | undefined;
  readonly #textValue: string | undefined;
  readonly #valueKind: ShapeAttributeValueKind;

  private constructor(
    name: string,
    numberValue: number | undefined,
    textValue: string | undefined,
    valueKind: ShapeAttributeValueKind
  ) {
    if (name.trim().length === 0) {
      throw new DomainError('attribute name must not be empty');
    }

    this.#name = name;
    this.#numberValue = numberValue;
    this.#textValue = textValue;
    this.#valueKind = valueKind;
  }

  public static number(name: string, value: number): ShapeAttributeUpdate {
    if (!Number.isFinite(value)) {
      throw new DomainError(`${name} must be a finite number`);
    }

    return new ShapeAttributeUpdate(
      name,
      value,
      undefined,
      ShapeAttributeValueKind.Number
    );
  }

  public static text(name: string, value: string): ShapeAttributeUpdate {
    return new ShapeAttributeUpdate(
      name,
      undefined,
      value,
      ShapeAttributeValueKind.Text
    );
  }

  public get name(): string {
    return this.#name;
  }

  public get valueKind(): ShapeAttributeValueKind {
    return this.#valueKind;
  }

  public get numericValue(): number {
    if (this.#numberValue === undefined) {
      throw new DomainError(`${this.#name} requires a numeric value`);
    }

    return this.#numberValue;
  }

  public get textValue(): string {
    if (this.#textValue === undefined) {
      throw new DomainError(`${this.#name} requires a text value`);
    }

    return this.#textValue;
  }
}
