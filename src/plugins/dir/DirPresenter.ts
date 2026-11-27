import type { CommandPresenter } from '../../application/commands/contracts/CommandPresenter.js';
import type { DirectoryEntry } from '../../application/ports/DirectoryEntry.js';
export class DirPresenter implements CommandPresenter<readonly DirectoryEntry[]> {
  public format(entries: readonly DirectoryEntry[]): string {
    if (entries.length === 0) return '(empty directory)';
    return [...entries].sort((a,b) => Number(b.isDirectory)-Number(a.isDirectory) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
      .map(e => (e.isDirectory ? '[DIR]  ' : '[FILE]  ') + e.name).join('\n');
  }
}
