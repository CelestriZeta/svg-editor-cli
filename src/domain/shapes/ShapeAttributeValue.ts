import { DomainError } from '../DomainError.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';

type AttributeValueKind = 'absent' | 'number' | 'text';

export class ShapeAttributeValue {
  readonly #kind: AttributeValueKind;
  readonly #numberValue: number | undefined;
  readonly #textValue: string | undefined;

  private constructor(
    kind: AttributeValueKind,
    numberValue: number | undefined,
    textValue: string | undefined
  ) {
    this.#kind = kind;
    this.#numberValue = numberValue;
    this.#textValue = textValue;
  }

  public static absent(): ShapeAttributeValue {
    return new ShapeAttributeValue('absent', undefined, undefined);
  }

  public static number(value: number): ShapeAttributeValue {
    if (!Number.isFinite(value)) {
      throw new DomainError('attribute value must be a finite number');
    }
    return new ShapeAttributeValue('number', value, undefined);
  }

  public static text(value: string): ShapeAttributeValue {
    return new ShapeAttributeValue('text', undefined, value);
  }

  public static fromUpdate(update: ShapeAttributeUpdate): ShapeAttributeValue {
    return update.valueKind === 'number'
      ? ShapeAttributeValue.number(update.numericValue)
      : ShapeAttributeValue.text(update.textValue);
  }

  public get isAbsent(): boolean {
    return this.#kind === 'absent';
  }

  public get numericValue(): number {
    if (this.#kind !== 'number' || this.#numberValue === undefined) {
      throw new DomainError('attribute value is not numeric');
    }
    return this.#numberValue;
  }

  public get textValue(): string {
    if (this.#kind !== 'text' || this.#textValue === undefined) {
      throw new DomainError('attribute value is not text');
    }
    return this.#textValue;
  }

  public equals(other: ShapeAttributeValue): boolean {
    if (this.#kind !== other.#kind) {
      return false;
    }
    if (this.#kind === 'number') {
      return this.#numberValue === other.#numberValue;
    }
    return this.#textValue === other.#textValue;
  }
}
