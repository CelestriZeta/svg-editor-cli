import type { Plugin } from '../../application/extensions/Plugin.js';
import type { PluginContext } from '../../application/extensions/PluginContext.js';
import { ArrowProvider } from './ArrowProvider.js';

export class ArrowPlugin implements Plugin {
  public activate(context: PluginContext): void {
    context.registerShape(new ArrowProvider());
  }
}

export default ArrowPlugin;
