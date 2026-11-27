import type { CommandResult } from './CommandResult.js';

export interface HistoryController {
  undo(): Promise<CommandResult>;
  redo(): Promise<CommandResult>;
}
