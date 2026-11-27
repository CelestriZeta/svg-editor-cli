import type { Plugin } from '../../src/application/extensions/Plugin.js';
import type { PluginContext } from '../../src/application/extensions/PluginContext.js';

export class RegistrationTestPlugin implements Plugin {
  public constructor(
    private readonly activation: (context: PluginContext) => void | Promise<void>
  ) {}

  public activate(context: PluginContext): void | Promise<void> {
    return this.activation(context);
  }
}
