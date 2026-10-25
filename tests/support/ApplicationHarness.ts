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
import { TreeFormatter } from '../../src/cli/TreeFormatter.js';

export class ApplicationHarness {
  readonly #history: CommandHistory;
  readonly #executor: CommandExecutor;
  readonly #formatter: OutputFormatter;
  readonly #repl: Repl;

  public constructor(store: DocumentStore) {
    const session = new EditorSession();
    const documents = new DocumentService(session, store);
    this.#history = new CommandHistory();
    const dispatcher = new CommandDispatcher(
      session,
      documents,
      this.#history,
      new DocumentViewVisitor()
    );
    this.#executor = new CommandExecutor(this.#history);
    this.#formatter = new OutputFormatter(new TreeFormatter());
    this.#repl = new Repl(
      new CommandLineParser(),
      dispatcher,
      this.#executor,
      this.#formatter
    );
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
