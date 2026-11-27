import { readdir } from 'node:fs/promises';
import type { DirectoryAccess } from '../application/ports/DirectoryAccess.js';
import { DirectoryEntry } from '../application/ports/DirectoryEntry.js';

export class NodeDirectoryAccess implements DirectoryAccess {
  public currentPath(): string { return process.cwd(); }
  public async entries(path: string): Promise<readonly DirectoryEntry[]> {
    const entries = await readdir(path, { withFileTypes: true });
    // 符号链接及特殊项按 FILE 展示，不跟随目标。
    return Object.freeze(entries.map(e => new DirectoryEntry(e.name, e.isDirectory())));
  }
}
