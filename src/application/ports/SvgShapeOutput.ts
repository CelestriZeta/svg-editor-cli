import { DomainError } from '../../domain/DomainError.js';

/** 几何属性与文本的不可变输出值；通用 id、样式和类型标记由适配器处理。 */
export class SvgShapeOutput {
  readonly #attributes: readonly (readonly [string, string | number])[];

  public constructor(
    attributes: readonly (readonly [string, string | number])[],
    private readonly textContent?: string
  ) {
    const names = new Set<string>(['id', 'fill', 'stroke', 'stroke-width', 'data-kind']);
    this.#attributes = Object.freeze(attributes.map(([name, value]) => {
      if (!/^[A-Za-z_][\w.-]*$/.test(name) || names.has(name) ||
          (typeof value !== 'string' && (typeof value !== 'number' || !Number.isFinite(value)))) {
        throw new DomainError('invalid SVG output attribute');
      }
      names.add(name);
      return Object.freeze([name, value] as const);
    }));
    if (textContent !== undefined && typeof textContent !== 'string') {
      throw new DomainError('invalid SVG output text');
    }
    Object.freeze(this);
  }

  public get attributes(): readonly (readonly [string, string | number])[] {
    return this.#attributes;
  }

  public get text(): string | undefined {
    return this.textContent;
  }
}
