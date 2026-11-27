import type { AttributeHandler } from './AttributeHandler.js';
import type { CommandContribution } from './CommandContribution.js';
import { ExtensionRegistry } from './ExtensionRegistry.js';
import type { ShapeProvider } from './ShapeProvider.js';
import type { TreeDecorator } from './TreeDecorator.js';
import { PluginRegistrationError } from './PluginRegistrationError.js';

/** 四类注册的同一发布版本，替换一次引用即可原子发布。 */
export class PluginContributions {
  public constructor(
    private readonly shapeProviders = ExtensionRegistry.empty<ShapeProvider>('shapes', ['createSpec']),
    private readonly commandContributions = ExtensionRegistry.empty<CommandContribution>('commands', ['create']),
    private readonly treeDecorators = ExtensionRegistry.empty<TreeDecorator>('decorators', ['labels']),
    private readonly attributeHandlers = ExtensionRegistry.empty<AttributeHandler>('attributes', ['handles', 'prepare'])
  ) {
    Object.freeze(this);
  }

  public get shapes(): ExtensionRegistry<ShapeProvider> {
    return this.shapeProviders;
  }

  public get commands(): ExtensionRegistry<CommandContribution> {
    return this.commandContributions;
  }

  public get decorators(): ExtensionRegistry<TreeDecorator> {
    return this.treeDecorators;
  }

  public get attributes(): ExtensionRegistry<AttributeHandler> {
    return this.attributeHandlers;
  }

  public withShape(provider: ShapeProvider): PluginContributions {
    return new PluginContributions(
      this.shapes.with(provider), this.commands, this.decorators, this.attributes
    );
  }

  public withCommand(command: CommandContribution): PluginContributions {
    const commands = this.commands.with(command);
    if (!Array.isArray(command.syntaxes) || command.syntaxes.length === 0 ||
        command.syntaxes.some((syntax: unknown) =>
          typeof syntax !== 'string' || syntax.trim().length === 0 || /[\r\n]/.test(syntax))) {
      throw new PluginRegistrationError(`invalid command syntax: ${command.name}`);
    }
    return new PluginContributions(
      this.shapes, commands, this.decorators, this.attributes
    );
  }

  public withDecorator(decorator: TreeDecorator): PluginContributions {
    return new PluginContributions(
      this.shapes, this.commands, this.decorators.with(decorator), this.attributes
    );
  }

  public withAttribute(handler: AttributeHandler): PluginContributions {
    return new PluginContributions(
      this.shapes, this.commands, this.decorators, this.attributes.with(handler)
    );
  }
}
