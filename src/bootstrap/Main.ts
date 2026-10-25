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

export class Main {
  public async run(): Promise<void> {
    const session = new EditorSession();
    const documents = new DocumentService(
      session,
      new SvgDocumentStore(new SvgReader(), new SvgWriteVisitor())
    );
    const history = new CommandHistory();
    const dispatcher = new CommandDispatcher(
      session,
      documents,
      history,
      new DocumentViewVisitor()
    );
    const executor = new CommandExecutor(history);
    const shapes = new ShapeFormatter();
    const repl = new Repl(
      new CommandLineParser(),
      dispatcher,
      executor,
      new OutputFormatter(
        new TreeFormatter(shapes),
        new ShowFormatter(shapes)
      )
    );
    const input = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: process.stdin.isTTY === true
    });

    try {
      await repl.run(
        input,
        (text) => process.stdout.write(text),
        { showPrompt: process.stdin.isTTY === true }
      );
    } finally {
      input.close();
    }
  }
}
