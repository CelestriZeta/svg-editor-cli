import type { SaxesAttributeNS } from 'saxes';

import { DomainError } from '../domain/DomainError.js';
import { ShapeStyle } from '../domain/shapes/ShapeStyle.js';

export class SvgAttributes {
  readonly #tagName: string;
  readonly #attributes: ReadonlyMap<string, SaxesAttributeNS>;

  public constructor(
    tagName: string,
    attributes: Record<string, SaxesAttributeNS>
  ) {
    this.#tagName = tagName;
    this.#attributes = new Map(
      Object.values(attributes).map((attribute) => [
        attribute.local,
        attribute
      ])
    );
  }

  public requireSupported(names: readonly string[]): void {
    const supported = new Set(names);
    for (const attribute of this.#attributes.values()) {
      const isNamespaceDeclaration =
        attribute.local === 'xmlns' &&
        attribute.uri === 'http://www.w3.org/2000/xmlns/';
      const isSupported =
        supported.has(attribute.local) &&
        (isNamespaceDeclaration ||
          (attribute.prefix.length === 0 && attribute.uri.length === 0));

      if (!isSupported) {
        throw new DomainError(`unsupported attribute: ${attribute.name}`);
      }
    }
  }

  public optionalId(): string | undefined {
    const id = this.#attributes.get('id')?.value;
    if (id !== undefined && id.trim().length === 0) {
      throw new DomainError('shape id must not be empty');
    }
    return id;
  }

  public requireNumber(name: string): number {
    const value = this.#attributes.get(name)?.value;
    if (value === undefined) {
      throw new DomainError(`${this.#tagName} ${name} is required`);
    }
    return this.number(value, `${this.#tagName} ${name} must be a number`);
  }

  public optionalNumber(name: string): number | undefined {
    const value = this.#attributes.get(name)?.value;
    if (value === undefined) {
      return undefined;
    }
    return this.number(value, `${this.#tagName} ${name} must be a number`);
  }

  public style(): ShapeStyle {
    return new ShapeStyle(
      this.#attributes.get('fill')?.value,
      this.#attributes.get('stroke')?.value,
      this.optionalNumber('stroke-width')
    );
  }

  public requireViewBox(width: number, height: number): void {
    const viewBox = this.#attributes.get('viewBox')?.value;
    if (viewBox === undefined) {
      return;
    }

    const values = viewBox.trim().split(/\s+/);
    if (
      values.length !== 4 ||
      values[0] !== '0' ||
      values[1] !== '0' ||
      this.number(values[2] ?? '', 'viewBox must contain numbers') !== width ||
      this.number(values[3] ?? '', 'viewBox must contain numbers') !== height
    ) {
      throw new DomainError(`viewBox must be 0 0 ${width} ${height}`);
    }
  }

  private number(value: string, message: string): number {
    if (
      !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)
    ) {
      throw new DomainError(message);
    }

    const number = Number(value);
    if (!Number.isFinite(number)) {
      throw new DomainError(message);
    }
    return number;
  }
}
