import type { Command } from '../../application/commands/contracts/Command.js';
import type { CommandContribution } from '../../application/extensions/CommandContribution.js';

export class BuiltinCommandContribution implements CommandContribution {
  readonly #syntaxes: readonly string[];

  public constructor(
    private readonly commandName: string,
    syntax: string | readonly string[],
    private readonly factory: (args: readonly string[]) => Command
  ) {
    this.#syntaxes = Object.freeze(typeof syntax === 'string' ? [syntax] : [...syntax]);
    Object.freeze(this);
  }

  public get name(): string {
    return this.commandName;
  }

  public get syntaxes(): readonly string[] {
    return this.#syntaxes;
  }

  public create(args: readonly string[]): Command {
    return this.factory(args);
  }
}
