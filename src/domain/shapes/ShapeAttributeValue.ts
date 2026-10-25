import { DomainError } from '../DomainError.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';
import { ShapeAttributeValueKind } from './ShapeAttributeValueKind.js';

enum StoredAttributeValueKind {
  Absent = 'absent',
  Number = 'number',
  Text = 'text'
}

export class ShapeAttributeValue {
  readonly #kind: StoredAttributeValueKind;
  readonly #numberValue: number | undefined;
  readonly #textValue: string | undefined;

  private constructor(
    kind: StoredAttributeValueKind,
    numberValue: number | undefined,
    textValue: string | undefined
  ) {
    this.#kind = kind;
    this.#numberValue = numberValue;
    this.#textValue = textValue;
  }

  public static absent(): ShapeAttributeValue {
    return new ShapeAttributeValue(
      StoredAttributeValueKind.Absent,
      undefined,
      undefined
    );
  }

  public static number(value: number): ShapeAttributeValue {
    if (!Number.isFinite(value)) {
      throw new DomainError('attribute value must be a finite number');
    }
    return new ShapeAttributeValue(
      StoredAttributeValueKind.Number,
      value,
      undefined
    );
  }

  public static text(value: string): ShapeAttributeValue {
    return new ShapeAttributeValue(
      StoredAttributeValueKind.Text,
      undefined,
      value
    );
  }

  public static fromUpdate(update: ShapeAttributeUpdate): ShapeAttributeValue {
    return update.valueKind === ShapeAttributeValueKind.Number
      ? ShapeAttributeValue.number(update.numericValue)
      : ShapeAttributeValue.text(update.textValue);
  }

  public get isAbsent(): boolean {
    return this.#kind === StoredAttributeValueKind.Absent;
  }

  public get kind(): ShapeAttributeValueKind {
    if (this.#kind === StoredAttributeValueKind.Number) {
      return ShapeAttributeValueKind.Number;
    }
    if (this.#kind === StoredAttributeValueKind.Text) {
      return ShapeAttributeValueKind.Text;
    }
    throw new DomainError('absent attribute has no value kind');
  }

  public get numericValue(): number {
    if (
      this.#kind !== StoredAttributeValueKind.Number ||
      this.#numberValue === undefined
    ) {
      throw new DomainError('attribute value is not numeric');
    }
    return this.#numberValue;
  }

  public get textValue(): string {
    if (
      this.#kind !== StoredAttributeValueKind.Text ||
      this.#textValue === undefined
    ) {
      throw new DomainError('attribute value is not text');
    }
    return this.#textValue;
  }

  public equals(other: ShapeAttributeValue): boolean {
    if (this.#kind !== other.#kind) {
      return false;
    }
    if (this.#kind === StoredAttributeValueKind.Number) {
      return this.#numberValue === other.#numberValue;
    }
    return this.#textValue === other.#textValue;
  }
}
