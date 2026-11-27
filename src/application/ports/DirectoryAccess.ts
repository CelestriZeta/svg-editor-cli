import type { DirectoryEntry } from './DirectoryEntry.js';

export interface DirectoryAccess {
  currentPath(): string;
  entries(path: string): Promise<readonly DirectoryEntry[]>;
}
