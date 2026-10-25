import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';

export class ErrorResult extends CommandResult {
  public override readonly succeeded = false;

  public constructor(
    private readonly message: string,
    private readonly errorCause?: unknown
  ) {
    super();
  }

  public get text(): string {
    return this.message;
  }

  public get cause(): unknown {
    return this.errorCause;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitError(this);
  }
}
