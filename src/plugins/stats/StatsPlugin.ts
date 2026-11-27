import type { Plugin } from '../../application/extensions/Plugin.js';
import type { PluginContext } from '../../application/extensions/PluginContext.js';
import type { PluginServices } from '../../application/extensions/PluginServices.js';
import { StatsContribution } from './StatsContribution.js';
export class StatsPlugin implements Plugin {
  public constructor(private readonly services: Pick<PluginServices, 'documents' | 'query'>) {}
  public activate(context: PluginContext): void { context.registerCommand(new StatsContribution(this.services)); }
}
export default StatsPlugin;
