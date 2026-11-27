import { PluginRegistrationError } from './PluginRegistrationError.js';

export type ExtensionCategory = 'shapes' | 'commands' | 'decorators' | 'attributes';

/** 持久化注册表：添加返回新实例；已发布实例和数组均不能被调用者改写。 */
export class ExtensionRegistry<T extends { readonly name: string }> {
  readonly #entries: ReadonlyMap<string, T>;

  private constructor(
    private readonly category: ExtensionCategory,
    private readonly requiredMethods: readonly (keyof T)[],
    entries: ReadonlyMap<string, T>
  ) {
    this.#entries = new Map(entries);
    Object.freeze(this);
  }

  public static empty<T extends { readonly name: string }>(
    category: ExtensionCategory,
    requiredMethods: readonly (keyof T)[]
  ): ExtensionRegistry<T> {
    return new ExtensionRegistry<T>(category, Object.freeze([...requiredMethods]), new Map());
  }

  public get(name: string): T | undefined {
    return this.#entries.get(name);
  }

  public values(): readonly T[] {
    return Object.freeze([...this.#entries.values()]);
  }

  public with(extension: T): ExtensionRegistry<T> {
    const name = extension.name;
    if (typeof name !== 'string' || name.length === 0 || /\s/.test(name)) {
      throw new PluginRegistrationError(`invalid registration name: ${this.category}`);
    }
    if (this.#entries.has(name)) {
      throw new PluginRegistrationError(`duplicate registration: ${this.category}/${name}`);
    }
    for (const method of this.requiredMethods) {
      if (typeof extension[method] !== 'function') {
        throw new PluginRegistrationError(
          `invalid registration: ${this.category}/${name} (missing method: ${String(method)})`
        );
      }
    }
    const entries = new Map(this.#entries);
    entries.set(name, extension);
    return new ExtensionRegistry(this.category, this.requiredMethods, entries);
  }
}
