import { PluginRegistrationError } from './PluginRegistrationError.js';
import type { PluginContributions } from './PluginContributions.js';

export class PluginManifest {
  readonly #names: ReadonlyMap<string, readonly string[]>;
  public constructor(public readonly name: string, contributes: unknown) {
    if (typeof name !== 'string' || name.length === 0 || contributes === null ||
      typeof contributes !== 'object' || Array.isArray(contributes)) throw new Error('invalid plugin manifest');
    const record = contributes as Record<string, unknown>;
    this.#names = new Map(['shapes', 'commands', 'decorators', 'attributes'].map(category => {
      const names = record[category] ?? [];
      if (!Array.isArray(names) || names.some(n => typeof n !== 'string' || !n || /\s/.test(n)) || new Set(names).size !== names.length) {
        throw new Error('invalid plugin manifest');
      }
      return [category, Object.freeze([...names].sort())];
    }));
  }

  public validate(before: PluginContributions, after: PluginContributions): void {
    const categories = ['shapes', 'commands', 'decorators', 'attributes'] as const;
    const declared = categories.map(c => `${c}=[${this.#names.get(c)!.join(',')}]`).join(';');
    const actual = categories.map(c => `${c}=[${after[c].values().filter(v => before[c].get(v.name) === undefined).map(v => v.name).sort().join(',')}]`).join(';');
    if (declared !== actual) throw new PluginRegistrationError(
      `plugin manifest mismatch: ${this.name} (declared: ${declared}, registered: ${actual})`);
  }
}
