import type { PluginLoader } from './PluginLoader.js';
import type { PluginServices } from '../application/extensions/PluginServices.js';

/** 方式 A 唯一的可选插件装配处。 */
export class CodePlugins {
  public async install(_loader: PluginLoader, _services: PluginServices): Promise<void> {}
}
