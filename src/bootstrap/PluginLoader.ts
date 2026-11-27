import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from '../application/extensions/Plugin.js';
import { PluginManifest } from '../application/extensions/PluginManifest.js';
import { PluginActivationError } from '../application/extensions/PluginActivationError.js';
import { PluginRegistrationError } from '../application/extensions/PluginRegistrationError.js';
import type { PluginRegistry } from '../application/extensions/PluginRegistry.js';
import type { PluginServices } from '../application/extensions/PluginServices.js';

export class PluginLoader {
  public constructor(private readonly registry: PluginRegistry, private readonly services: PluginServices,
    private readonly report: (message: string) => void) {}

  public async code(manifest: PluginManifest, plugin: Plugin): Promise<void> {
    try { await this.registry.activate(manifest.name, plugin, manifest); }
    catch (error) { this.report(`error: ${error instanceof Error ? error.message : String(error)}`); }
  }

  public async config(path: string): Promise<void> {
    let entries: { module: string; enabled?: boolean; options?: unknown }[];
    try {
      const config: unknown = JSON.parse(await readFile(path, 'utf8'));
      if (!config || typeof config !== 'object' || !('plugins' in config) || !Array.isArray(config.plugins)) throw new Error();
      entries = config.plugins;
      if (entries.some(e => !e || typeof e !== 'object' || typeof e.module !== 'string' || !e.module.trim() ||
        (e.enabled !== undefined && typeof e.enabled !== 'boolean'))) throw new Error();
    } catch { this.report('error: invalid plugin config'); return; }
    for (const entry of entries) {
      if (entry.enabled !== false) await this.module(entry.module, dirname(resolve(path)), entry.options);
    }
  }

  private async module(specifier: string, base: string, options: unknown): Promise<void> {
    let entry: string;
    let packagePath: string;
    try {
      if (specifier.startsWith('.') || isAbsolute(specifier)) {
        entry = resolve(base, specifier);
        if ((await stat(entry)).isDirectory()) {
          packagePath = join(entry, 'package.json');
          const metadata = JSON.parse(await readFile(packagePath, 'utf8')) as { main?: string };
          entry = resolve(entry, metadata.main ?? 'index.js');
        }
      } else {
        entry = createRequire(pathToFileURL(join(base, '__plugin_loader__.cjs'))).resolve(specifier);
      }
      await stat(entry);
    } catch { this.report(`error: plugin not found: ${specifier}`); return; }
    let name = specifier;
    try {
      let parent = dirname(entry);
      while (true) {
        try { await stat(join(parent, 'package.json')); break; }
        catch { const next = dirname(parent); if (next === parent) throw new Error('missing package.json'); parent = next; }
      }
      const metadata = JSON.parse(await readFile(join(parent, 'package.json'), 'utf8')) as { name: string; contributes?: unknown };
      name = metadata.name ?? specifier;
      const manifest = new PluginManifest(name, metadata.contributes ?? {});
      const namespace = await import(pathToFileURL(entry).href) as { default?: unknown };
      if (namespace.default === undefined) { this.report(`error: plugin has no default export: ${specifier}`); return; }
      const exported = namespace.default;
      const plugin: Plugin = typeof exported === 'function'
        ? new (exported as new (services: PluginServices, options: unknown) => Plugin)(this.services, options)
        : exported as Plugin;
      if (plugin === null || typeof plugin?.activate !== 'function') throw new Error('invalid plugin export');
      await this.registry.activate(name, plugin, manifest);
    } catch (error) {
      const failure = error instanceof PluginRegistrationError || error instanceof PluginActivationError
        ? error : new PluginActivationError(name, error);
      this.report(`error: ${failure.message}`);
    }
  }
}
