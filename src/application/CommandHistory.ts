import type { UndoableCommand } from './commands/contracts/UndoableCommand.js';

export class CommandHistory {
  readonly #undoStack: UndoableCommand[] = [];
  readonly #redoStack: UndoableCommand[] = [];
  #blocked = false;

  public record(command: UndoableCommand): void {
    this.#undoStack.push(command);
    this.#redoStack.length = 0;
    this.#blocked = false;
  }

  public establishIoBarrier(): void {
    this.#undoStack.length = 0;
    this.#redoStack.length = 0;
    this.#blocked = true;
  }

  public canUndo(): boolean {
    return !this.#blocked && this.#undoStack.length > 0;
  }

  public undoCount(): number {
    return this.#undoStack.length;
  }

  public isBlocked(): boolean {
    return this.#blocked;
  }
}
