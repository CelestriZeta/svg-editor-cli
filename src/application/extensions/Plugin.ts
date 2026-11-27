import type { PluginContext } from './PluginContext.js';

export interface Plugin {
  activate(context: PluginContext): void | Promise<void>;
}
