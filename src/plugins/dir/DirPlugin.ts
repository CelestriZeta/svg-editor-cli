import type { Plugin } from '../../application/extensions/Plugin.js';
import type { PluginContext } from '../../application/extensions/PluginContext.js';
import type { PluginServices } from '../../application/extensions/PluginServices.js';
import { DirContribution } from './DirContribution.js';
export class DirPlugin implements Plugin {
  public constructor(private readonly services: Pick<PluginServices, 'directory'>) {}
  public activate(context: PluginContext): void { context.registerCommand(new DirContribution(this.services.directory)); }
}
export default DirPlugin;
