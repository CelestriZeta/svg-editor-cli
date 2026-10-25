import type { CommandDispatcher } from '../application/CommandDispatcher.js';
import type { CommandExecutor } from '../application/CommandExecutor.js';
import { ErrorResult } from '../application/commands/results/ErrorResult.js';
import { CommandSyntaxError } from './CommandSyntaxError.js';
import type { CommandLineParser } from './CommandLineParser.js';
import type { OutputFormatter } from './OutputFormatter.js';

export type ReplWriter = (text: string) => void;

export interface ReplRunOptions {
  readonly showPrompt?: boolean;
}

export class Repl {
  public constructor(
    private readonly parser: CommandLineParser,
    private readonly dispatcher: CommandDispatcher,
    private readonly executor: CommandExecutor,
    private readonly formatter: OutputFormatter
  ) {}

  public async executeLine(line: string): Promise<string | null> {
    let tokens: string[] | null;
    try {
      tokens = this.parser.parse(line);
    } catch (error) {
      if (error instanceof CommandSyntaxError) {
        return this.formatter.format(new ErrorResult(error.message, error));
      }
      throw error;
    }

    if (tokens === null) {
      return null;
    }

    const command = this.dispatcher.create(tokens);
    const result = await this.executor.execute(command);
    return this.formatter.format(result);
  }

  public async run(
    lines: AsyncIterable<string>,
    write: ReplWriter,
    options: ReplRunOptions = {}
  ): Promise<void> {
    write("svg-editor 0.1 - type 'help' for commands\n");
    const showPrompt = options.showPrompt ?? false;
    const iterator = lines[Symbol.asyncIterator]();

    while (true) {
      if (showPrompt) {
        write('svg> ');
      }
      const next = await iterator.next();
      if (next.done) {
        if (showPrompt) {
          write('\n');
        }
        break;
      }

      const output = await this.executeLine(next.value);
      if (output !== null) {
        write(`${output}\n`);
      }
    }
  }
}
