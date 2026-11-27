import type { Plugin } from '../../application/extensions/Plugin.js';
import type { PluginContext } from '../../application/extensions/PluginContext.js';
import { BoxProvider } from './BoxProvider.js';
import { BoxAttributeHandler } from './BoxAttributeHandler.js';
import { BoxTypeDecorator } from './BoxTypeDecorator.js';
export class BoxPlugin implements Plugin {
  public activate(context: PluginContext): void {context.registerShape(new BoxProvider());context.registerAttribute(new BoxAttributeHandler());context.registerDecorator(new BoxTypeDecorator());}
}
export default BoxPlugin;
