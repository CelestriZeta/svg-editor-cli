import type { ShapeCatalog } from '../../src/application/extensions/ShapeCatalog.js';
import type { ShapeProvider } from '../../src/application/extensions/ShapeProvider.js';
import { BuiltinShapesPlugin } from '../../src/plugins/builtin-shapes/BuiltinShapesPlugin.js';

export class TestShapeCatalog implements ShapeCatalog {
  readonly #providers = new Map<string, ShapeProvider>();
  public constructor() {
    const unexpected = (): never => { throw new Error('unexpected contribution'); };
    new BuiltinShapesPlugin().activate({
      registerShape: (provider) => { this.#providers.set(provider.name, provider); },
      registerCommand: unexpected, registerDecorator: unexpected, registerAttribute: unexpected
    });
  }
  public findShape(name: string): ShapeProvider | undefined { return this.#providers.get(name); }
  public shapeSyntaxes(): readonly string[] {
    return Object.freeze([...this.#providers.values()].flatMap((provider) => provider.syntaxes));
  }
}
