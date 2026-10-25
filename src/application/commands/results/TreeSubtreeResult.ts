import type { ShapeSnapshot } from '../../queries/ShapeSnapshot.js';
import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';

export class TreeSubtreeResult extends CommandResult {
  public override readonly succeeded = true;
  readonly #root: ShapeSnapshot;

  public constructor(root: ShapeSnapshot) {
    super();
    this.#root = root;
  }

  public get root(): ShapeSnapshot {
    return this.#root;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitTreeSubtree(this);
  }
}
