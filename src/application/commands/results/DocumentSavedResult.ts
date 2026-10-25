import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';

export class DocumentSavedResult extends CommandResult {
  public override readonly succeeded = true;

  public constructor(
    private readonly savedPath: string,
    private readonly savedElementCount: number
  ) {
    super();
  }

  public get path(): string {
    return this.savedPath;
  }

  public get elementCount(): number {
    return this.savedElementCount;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitDocumentSaved(this);
  }
}
