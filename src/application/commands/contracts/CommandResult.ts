import type { CommandResultVisitor } from './CommandResultVisitor.js';

export abstract class CommandResult {
  public abstract readonly succeeded: boolean;

  public abstract accept<T>(visitor: CommandResultVisitor<T>): T;
}
