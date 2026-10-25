import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';

export class CanvasResult extends CommandResult {
  public override readonly succeeded = true;

  public constructor(
    private readonly canvasWidth: number,
    private readonly canvasHeight: number
  ) {
    super();
  }

  public get width(): number {
    return this.canvasWidth;
  }

  public get height(): number {
    return this.canvasHeight;
  }

  public override accept<T>(visitor: CommandResultVisitor<T>): T {
    return visitor.visitCanvas(this);
  }
}
