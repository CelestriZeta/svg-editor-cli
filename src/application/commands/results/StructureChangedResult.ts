import { CommandResult } from '../contracts/CommandResult.js';
import type { EditDirection } from './EditDirection.js';

export abstract class StructureChangedResult extends CommandResult {
  public override readonly succeeded = true;

  protected constructor(
    private readonly changedShapeType: string,
    private readonly changedShapeId: string,
    private readonly didChange: boolean,
    private readonly editDirectionValue: EditDirection
  ) {
    super();
  }

  public get shapeType(): string {
    return this.changedShapeType;
  }

  public get shapeId(): string {
    return this.changedShapeId;
  }

  public get changed(): boolean {
    return this.didChange;
  }

  public get editDirection(): EditDirection {
    return this.editDirectionValue;
  }
}
