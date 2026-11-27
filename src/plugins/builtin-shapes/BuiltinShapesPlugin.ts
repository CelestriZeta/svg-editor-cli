import type { Plugin } from '../../application/extensions/Plugin.js';
import type { PluginContext } from '../../application/extensions/PluginContext.js';
import { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';
import { RectShapeProvider } from './RectShapeProvider.js';
import { CircleShapeProvider } from './CircleShapeProvider.js';
import { EllipseShapeProvider } from './EllipseShapeProvider.js';
import { LineShapeProvider } from './LineShapeProvider.js';
import { TextShapeProvider } from './TextShapeProvider.js';
import { GroupShapeProvider } from './GroupShapeProvider.js';

export class BuiltinShapesPlugin implements Plugin {
  public activate(context: PluginContext): void {
    const numbers = new CommandNumberParser();
    context.registerShape(new RectShapeProvider(numbers));
    context.registerShape(new CircleShapeProvider(numbers));
    context.registerShape(new EllipseShapeProvider(numbers));
    context.registerShape(new LineShapeProvider(numbers));
    context.registerShape(new TextShapeProvider(numbers));
    context.registerShape(new GroupShapeProvider());
  }
}

export default BuiltinShapesPlugin;
