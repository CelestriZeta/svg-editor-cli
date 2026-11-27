import { EventEmitter, FileDecoration, FileType, workspace } from 'vscode';
import type { CancellationToken, Disposable, FileDecorationProvider, Uri } from 'vscode';

export class SvgFileDecorationProvider implements FileDecorationProvider {
  readonly #changes = new EventEmitter<Uri>();
  public readonly onDidChangeFileDecorations = this.#changes.event;

  public async provideFileDecoration(
    uri: Uri,
    token: CancellationToken
  ): Promise<FileDecoration | undefined> {
    if (token.isCancellationRequested || !uri.path.toLowerCase().endsWith('.svg')) {
      return undefined;
    }
    try {
      const stat = await workspace.fs.stat(uri);
      if (token.isCancellationRequested || (stat.type & FileType.File) === 0) {
        return undefined;
      }
      return new FileDecoration('[]', 'SVG 文件');
    } catch {
      // Explorer 查询期间文件可能被删除，或远程文件系统暂时不可访问。
      return undefined;
    }
  }

  public watch(subscriptions: Disposable[]): void {
    const watcher = workspace.createFileSystemWatcher('**/*.[sS][vV][gG]');
    subscriptions.push(
      this.#changes,
      watcher,
      watcher.onDidCreate((uri) => this.#changes.fire(uri)),
      watcher.onDidChange((uri) => this.#changes.fire(uri)),
      watcher.onDidDelete((uri) => this.#changes.fire(uri))
    );
  }
}
