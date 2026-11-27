import type { Plugin } from '../../application/extensions/Plugin.js';
import type { PluginContext } from '../../application/extensions/PluginContext.js';
import type { PluginServices } from '../../application/extensions/PluginServices.js';
import { ModifiedStarDecorator } from './ModifiedStarDecorator.js';
export class ModifiedStarPlugin implements Plugin {
  public constructor(private readonly services: Pick<PluginServices,'checkpoints'>) {}
  public activate(context: PluginContext): void {context.registerDecorator(new ModifiedStarDecorator(this.services.checkpoints));}
}
export default ModifiedStarPlugin;
