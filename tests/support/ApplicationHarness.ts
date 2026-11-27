import type { Plugin } from '../../src/application/extensions/Plugin.js';
import { BuiltinShapesPlugin } from '../../src/plugins/builtin-shapes/BuiltinShapesPlugin.js';
import { CommandDispatcher } from '../../src/application/CommandDispatcher.js';
import { CommandExecutor } from '../../src/application/CommandExecutor.js';
import { CommandHistory } from '../../src/application/CommandHistory.js';
import { DocumentService } from '../../src/application/DocumentService.js';
import { EditorSession } from '../../src/application/EditorSession.js';
import type { DocumentStore } from '../../src/application/ports/DocumentStore.js';
import { DocumentViewVisitor } from '../../src/application/queries/DocumentViewVisitor.js';
import { CommandLineParser } from '../../src/cli/CommandLineParser.js';
import { OutputFormatter } from '../../src/cli/OutputFormatter.js';
import { Repl } from '../../src/cli/Repl.js';
import { ShapeFormatter } from '../../src/cli/ShapeFormatter.js';
import { ShowFormatter } from '../../src/cli/ShowFormatter.js';
import { TreeFormatter } from '../../src/cli/TreeFormatter.js';
import { PluginRegistry } from '../../src/application/extensions/PluginRegistry.js';
import { BuiltinCommandsPlugin } from '../../src/plugins/builtin-commands/BuiltinCommandsPlugin.js';

export class ApplicationHarness {
  readonly #history: CommandHistory;
  readonly #executor: CommandExecutor;
  readonly #formatter: OutputFormatter;
  readonly #repl: Repl;
  readonly #builtins: BuiltinCommandsPlugin;

  private constructor(store: DocumentStore, private readonly pluginRegistry: PluginRegistry) {
    const session = new EditorSession();
    const documents = new DocumentService(session, store);
    this.#history = new CommandHistory();
    this.#builtins = new BuiltinCommandsPlugin(
      session, documents, this.#history, new DocumentViewVisitor(), pluginRegistry
    );
    const dispatcher = new CommandDispatcher(pluginRegistry);
    this.#executor = new CommandExecutor(this.#history);
    const shapes = new ShapeFormatter();
    this.#formatter = new OutputFormatter(
      new TreeFormatter(shapes),
      new ShowFormatter(shapes)
    );
    this.#repl = new Repl(
      new CommandLineParser(),
      dispatcher,
      this.#executor,
      this.#formatter
    );
  }

  public static async create(store: DocumentStore, shapes: Plugin | null = new BuiltinShapesPlugin()): Promise<ApplicationHarness> {
    const plugins = new PluginRegistry();
    const harness = new ApplicationHarness(store, plugins);
    if (shapes !== null) await plugins.activate('builtin-shapes', shapes);
    await plugins.activate('builtin-commands', harness.#builtins);
    return harness;
  }

  public get plugins(): PluginRegistry {
    return this.pluginRegistry;
  }

  public get history(): CommandHistory {
    return this.#history;
  }

  public get executor(): CommandExecutor {
    return this.#executor;
  }

  public get formatter(): OutputFormatter {
    return this.#formatter;
  }

  public get repl(): Repl {
    return this.#repl;
  }
}
