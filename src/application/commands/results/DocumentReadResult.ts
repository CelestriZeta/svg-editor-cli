import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import type { AssignedShapeId } from './AssignedShapeId.js';

export class DocumentReadResult extends CommandResult {
  public override readonly succeeded = true;
  readonly #idAssignments: readonly AssignedShapeId[];

  public constructor(
    private readonly readPath: string,
    private readonly readElementCount: number,
    idAssignments: readonly AssignedShapeId[]
  ) {
    super();
    this.#idAssignments = Object.freeze([...idAssignments]);
  }

  public get path(): string {
    return this.readPath;
  }

  public get elementCount(): number {
    return this.readElementCount;
  }

  public get assignedIds(): readonly AssignedShapeId[] {
    return this.#idAssignments;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitDocumentRead(this);
  }
}
