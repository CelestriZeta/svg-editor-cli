import { NodeDirectoryAccess } from '../infrastructure/NodeDirectoryAccess.js';
import { PluginLoader } from './PluginLoader.js';
import { CodePlugins } from './CodePlugins.js';
import { DocumentCheckpoints } from '../application/DocumentCheckpoints.js';
import { BuiltinShapesPlugin } from '../plugins/builtin-shapes/BuiltinShapesPlugin.js';
import { createInterface } from 'node:readline';

import { CommandDispatcher } from '../application/CommandDispatcher.js';
import { CommandExecutor } from '../application/CommandExecutor.js';
import { CommandHistory } from '../application/CommandHistory.js';
import { DocumentService } from '../application/DocumentService.js';
import { DocumentViewVisitor } from '../application/queries/DocumentViewVisitor.js';
import { EditorSession } from '../application/EditorSession.js';
import { CommandLineParser } from '../cli/CommandLineParser.js';
import { OutputFormatter } from '../cli/OutputFormatter.js';
import { Repl } from '../cli/Repl.js';
import { ShapeFormatter } from '../cli/ShapeFormatter.js';
import { ShowFormatter } from '../cli/ShowFormatter.js';
import { TreeFormatter } from '../cli/TreeFormatter.js';
import { SvgDocumentStore } from '../infrastructure/SvgDocumentStore.js';
import { SvgReader } from '../infrastructure/SvgReader.js';
import { SvgWriteVisitor } from '../infrastructure/SvgWriteVisitor.js';
import { PluginRegistry } from '../application/extensions/PluginRegistry.js';
import { BuiltinCommandsPlugin } from '../plugins/builtin-commands/BuiltinCommandsPlugin.js';

export class Main {
  public async run(): Promise<void> {
    const session = new EditorSession();
    const plugins = new PluginRegistry();
    await plugins.activate('builtin-shapes', new BuiltinShapesPlugin());
    const views = new DocumentViewVisitor(plugins);
    const checkpoints = new DocumentCheckpoints(views);
    const documents = new DocumentService(
      session,
      new SvgDocumentStore(new SvgReader(plugins), new SvgWriteVisitor(plugins)), checkpoints
    );
    const history = new CommandHistory();
    await plugins.activate('builtin-commands', new BuiltinCommandsPlugin(
      session, documents, history, new DocumentViewVisitor(plugins), plugins
    ));
    const services = Object.freeze({ documents: session, query: views, checkpoints, directory: new NodeDirectoryAccess() });
    const loader = new PluginLoader(plugins, services, message => process.stdout.write(message + '\n'));
    const args = process.argv.slice(2);
    if (args.length === 0) await new CodePlugins().install(loader, services);
    else if (args.length === 2 && args[0] === '--config') await loader.config(args[1]!);
    else process.stdout.write('error: invalid plugin config\n');
    const dispatcher = new CommandDispatcher(plugins);
    const executor = new CommandExecutor(history);
    const shapes = new ShapeFormatter();
    const repl = new Repl(
      new CommandLineParser(),
      dispatcher,
      executor,
      new OutputFormatter(
        new TreeFormatter(shapes, plugins, () => views.visit(session.requireDocument())),
        new ShowFormatter(shapes)
      )
    );
    const input = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'svg> ',
      terminal: process.stdin.isTTY === true
    });

    try {
      await repl.run(
        input,
        (text) => process.stdout.write(text),
        process.stdin.isTTY === true ? { prompt: () => input.prompt() } : {}
      );
    } finally {
      input.close();
    }
  }
}
