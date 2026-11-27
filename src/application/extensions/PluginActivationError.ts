export class PluginActivationError extends Error {
  public constructor(pluginName: string, cause: unknown) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    super(`plugin failed to activate: ${pluginName} (${reason})`, { cause });
    this.name = 'PluginActivationError';
  }
}
