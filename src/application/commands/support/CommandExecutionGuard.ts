import { DomainError } from '../../../domain/DomainError.js';
import { DocumentStoreError } from '../../ports/DocumentStoreError.js';
import type { CommandResult } from '../contracts/CommandResult.js';
import { ErrorResult } from '../results/ErrorResult.js';

export class CommandExecutionGuard {
  public static async run(
    action: () => Promise<CommandResult>
  ): Promise<CommandResult> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof DomainError || error instanceof DocumentStoreError) {
        return new ErrorResult(error.message, error);
      }
      throw error;
    }
  }
}
