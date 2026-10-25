import { DomainError } from '../DomainError.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';
import { ShapeAttributeValue } from './ShapeAttributeValue.js';

type AttributeCapture = () => ShapeAttributeValue;
type AttributeValidator = (value: number | string) => void;
type AttributeWriter = (value: ShapeAttributeValue) => void;

export class ShapeAttributeSlot {
  private constructor(
    private readonly attributeName: string,
    private readonly valueKind: 'number' | 'text',
    private readonly captureValue: AttributeCapture,
    private readonly validateValue: AttributeValidator,
    private readonly writeValue: AttributeWriter
  ) {}

  public static number(
    name: string,
    capture: AttributeCapture,
    write: AttributeWriter,
    validate: (value: number) => void = () => undefined
  ): ShapeAttributeSlot {
    return new ShapeAttributeSlot(
      name,
      'number',
      capture,
      (value) => {
        if (typeof value !== 'number') {
          throw new DomainError(`${name} requires a numeric value`);
        }
        validate(value);
      },
      write
    );
  }

  public static text(
    name: string,
    capture: AttributeCapture,
    write: AttributeWriter,
    validate: (value: string) => void = () => undefined
  ): ShapeAttributeSlot {
    return new ShapeAttributeSlot(
      name,
      'text',
      capture,
      (value) => {
        if (typeof value !== 'string') {
          throw new DomainError(`${name} requires a text value`);
        }
        validate(value);
      },
      write
    );
  }

  public get name(): string {
    return this.attributeName;
  }

  public capture(): ShapeAttributeValue {
    return this.captureValue();
  }

  public prepare(update: ShapeAttributeUpdate): ShapeAttributeValue {
    if (update.name !== this.attributeName) {
      throw new DomainError(
        `attribute slot ${this.attributeName} cannot accept ${update.name}`
      );
    }
    if (update.valueKind !== this.valueKind) {
      throw new DomainError(
        `${this.attributeName} requires a ${this.valueKind === 'number' ? 'numeric' : 'text'} value`
      );
    }

    const value =
      update.valueKind === 'number'
        ? update.numericValue
        : update.textValue;
    this.validateValue(value);
    return ShapeAttributeValue.fromUpdate(update);
  }

  public write(value: ShapeAttributeValue): void {
    this.writeValue(value);
  }
}
