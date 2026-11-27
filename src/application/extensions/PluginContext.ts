import type { AttributeHandler } from './AttributeHandler.js';
import type { CommandContribution } from './CommandContribution.js';
import type { ShapeProvider } from './ShapeProvider.js';
import type { TreeDecorator } from './TreeDecorator.js';

/** 仅在一次 activate 期间有效；不提供提交、注销或应用内部状态访问。 */
export interface PluginContext {
  registerShape(provider: ShapeProvider): void;
  registerCommand(command: CommandContribution): void;
  registerDecorator(decorator: TreeDecorator): void;
  registerAttribute(handler: AttributeHandler): void;
}
