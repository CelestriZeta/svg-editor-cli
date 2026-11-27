import type { SvgDocument } from '../domain/document/SvgDocument.js';
import type { DocumentQuery } from './queries/DocumentQuery.js';
import type { DocumentView } from './queries/DocumentView.js';
import type { CheckpointSource } from './ports/CheckpointSource.js';

export class DocumentCheckpoints implements CheckpointSource {
  readonly #listeners = new Set<(view: DocumentView) => void>();
  #last: DocumentView | undefined;

  public constructor(private readonly query: DocumentQuery) {}

  public subscribe(listener: (view: DocumentView) => void): () => void {
    if (this.#last !== undefined) listener(this.#last);
    this.#listeners.add(listener);
    return () => { this.#listeners.delete(listener); };
  }

  /** 通知失败不改变已经成功的 IO；只读插件不得向此回调传播写操作。 */
  public capture(document: SvgDocument): void {
    try {
      const view = this.query.visit(document);
      this.#last = view;
      for (const listener of this.#listeners) {
        try { listener(view); } catch { /* 隔离观察者异常。 */ }
      }
    } catch { /* 观察能力不能使已成功的 IO 变成失败。 */ }
  }
}
