import { DomainError } from '../domain/DomainError.js';
import type { CommandResult } from './commands/contracts/CommandResult.js';
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

  public canRedo(): boolean {
    return !this.#blocked && this.#redoStack.length > 0;
  }

  public undoCount(): number {
    return this.#undoStack.length;
  }

  public redoCount(): number {
    return this.#redoStack.length;
  }

  public isBlocked(): boolean {
    return this.#blocked;
  }

  public async undo(): Promise<CommandResult> {
    this.requireTransitionAllowed(this.#undoStack.length, 'nothing to undo');
    const command = this.#undoStack.at(-1);
    if (command === undefined) {
      throw new DomainError('nothing to undo');
    }
    const result = await command.undo();
    // 先恢复文档，再迁移历史；失败时命令仍留在原栈，redo 同理。
    if (result.succeeded) {
      this.#undoStack.pop();
      this.#redoStack.push(command);
    }
    return result;
  }

  public async redo(): Promise<CommandResult> {
    this.requireTransitionAllowed(this.#redoStack.length, 'nothing to redo');
    const command = this.#redoStack.at(-1);
    if (command === undefined) {
      throw new DomainError('nothing to redo');
    }
    const result = await command.redo();
    if (result.succeeded) {
      this.#redoStack.pop();
      this.#undoStack.push(command);
    }
    return result;
  }

  private requireTransitionAllowed(
    count: number,
    emptyMessage: string
  ): void {
    if (this.#blocked) {
      throw new DomainError('undo not allowed after io command');
    }
    if (count === 0) {
      throw new DomainError(emptyMessage);
    }
  }
}
