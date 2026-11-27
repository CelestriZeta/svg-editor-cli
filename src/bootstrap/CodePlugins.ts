import { ModifiedStarPlugin } from '../plugins/modified-star/ModifiedStarPlugin.js';
import { DirPlugin } from '../plugins/dir/DirPlugin.js';
import { BoxPlugin } from '../plugins/shape-box/BoxPlugin.js';
import { StatsPlugin } from '../plugins/stats/StatsPlugin.js';
import { PluginManifest } from '../application/extensions/PluginManifest.js';
import type { PluginLoader } from './PluginLoader.js';
import type { PluginServices } from '../application/extensions/PluginServices.js';

/** 方式 A 唯一的可选插件装配处。 */
export class CodePlugins {
  public async install(loader: PluginLoader, services: PluginServices): Promise<void> {
    await loader.code(new PluginManifest('@svgframe/plugin-shape-box', { shapes: ['box'], attributes: ['box-attributes'], decorators: ['box-type-label'] }), new BoxPlugin());
    await loader.code(new PluginManifest('@svgframe/plugin-stats', { commands: ['stats'] }), new StatsPlugin(services));
    await loader.code(new PluginManifest('@svgframe/plugin-dir', { commands: ['dir'] }), new DirPlugin(services));
    await loader.code(new PluginManifest('@svgframe/plugin-modified-star', { decorators: ['modified-star'] }), new ModifiedStarPlugin(services));
  }
}
