import { DomainError } from '../../../domain/DomainError.js';

const DECIMAL_NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

export class CommandNumberParser {
  public parseShape(
    type: string,
    value: string | undefined,
    field: string
  ): number {
    if (value === undefined || !DECIMAL_NUMBER.test(value)) {
      throw new DomainError(`${type} ${field} must be a number`);
    }
    return Number(value);
  }

  public parseCanvas(value: string | undefined): number {
    return value !== undefined && DECIMAL_NUMBER.test(value)
      ? Number(value)
      : Number.NaN;
  }
}
