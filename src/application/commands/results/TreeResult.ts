import type { DocumentView } from '../../queries/DocumentView.js';
import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';

export class TreeResult extends CommandResult {
  public override readonly succeeded = true;
  readonly #view: DocumentView;

  public constructor(view: DocumentView) {
    super();
    this.#view = view;
  }

  public get view(): DocumentView {
    return this.#view;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitTree(this);
  }
}
