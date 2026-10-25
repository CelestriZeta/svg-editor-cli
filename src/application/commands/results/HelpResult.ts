import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';

export class HelpResult extends CommandResult {
  public override readonly succeeded = true;
  readonly #syntaxes: readonly string[];

  public constructor(syntaxes: readonly string[]) {
    super();
    this.#syntaxes = [...syntaxes];
  }

  public get syntaxes(): readonly string[] {
    return this.#syntaxes;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitHelp(this);
  }
}
