import type { AttributeHandler } from './AttributeHandler.js';
import type { CommandContribution } from './CommandContribution.js';
import type { CommandCatalog } from './CommandCatalog.js';
import type { ExtensionRegistry } from './ExtensionRegistry.js';
import type { Plugin } from './Plugin.js';
import { PluginActivationError } from './PluginActivationError.js';
import { PluginContributions } from './PluginContributions.js';
import { PluginRegistration } from './PluginRegistration.js';
import { PluginRegistrationError } from './PluginRegistrationError.js';
import type { ShapeProvider } from './ShapeProvider.js';
import type { ShapeCatalog } from './ShapeCatalog.js';
import type { TreeDecorator } from './TreeDecorator.js';

export class PluginRegistry implements CommandCatalog, ShapeCatalog {
  #published = new PluginContributions();
  #tail: Promise<void> = Promise.resolve();

  public get shapes(): ExtensionRegistry<ShapeProvider> {
    return this.#published.shapes;
  }

  public get commands(): ExtensionRegistry<CommandContribution> {
    return this.#published.commands;
  }

  public get decorators(): ExtensionRegistry<TreeDecorator> {
    return this.#published.decorators;
  }

  public get attributes(): ExtensionRegistry<AttributeHandler> {
    return this.#published.attributes;
  }

  public findCommand(name: string): CommandContribution | undefined {
    return this.commands.get(name);
  }

  public findShape(name: string): ShapeProvider | undefined {
    return this.shapes.get(name);
  }

  public shapeSyntaxes(): readonly string[] {
    return Object.freeze(this.shapes.values().flatMap((shape) => shape.syntaxes));
  }

  public commandSyntaxes(): readonly string[] {
    return Object.freeze(this.commands.values().flatMap((command) => command.syntaxes));
  }

  public activate(name: string, plugin: Plugin): Promise<void> {
    const activation = this.#tail.then(() => this.runActivation(name, plugin));
    this.#tail = activation.catch(() => undefined);
    return activation;
  }

  private async runActivation(name: string, plugin: Plugin): Promise<void> {
    const registration = new PluginRegistration(this.#published);
    try {
      await plugin.activate(registration.context);
      this.#published = registration.finish();
    } catch (error) {
      registration.close();
      if (error instanceof PluginRegistrationError) {
        throw error;
      }
      throw new PluginActivationError(name, error);
    }
  }
}
