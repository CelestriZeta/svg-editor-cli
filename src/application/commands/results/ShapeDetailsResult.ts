import type { ShapeSnapshot } from '../../queries/ShapeSnapshot.js';
import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';

export class ShapeDetailsResult extends CommandResult {
  public override readonly succeeded = true;
  readonly #details: ShapeSnapshot;

  public constructor(details: ShapeSnapshot) {
    super();
    this.#details = details;
  }

  public get details(): ShapeSnapshot {
    return this.#details;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitShapeDetails(this);
  }
}
