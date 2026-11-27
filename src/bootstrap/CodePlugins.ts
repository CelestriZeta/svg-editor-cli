import { StatsPlugin } from '../plugins/stats/StatsPlugin.js';
import { PluginManifest } from '../application/extensions/PluginManifest.js';
import type { PluginLoader } from './PluginLoader.js';
import type { PluginServices } from '../application/extensions/PluginServices.js';

/** 方式 A 唯一的可选插件装配处。 */
export class CodePlugins {
  public async install(loader: PluginLoader, services: PluginServices): Promise<void> {
    await loader.code(new PluginManifest('@svgframe/plugin-stats', { commands: ['stats'] }), new StatsPlugin(services));
  }
}
