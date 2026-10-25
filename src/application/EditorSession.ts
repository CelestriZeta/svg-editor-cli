import { DomainError } from '../domain/DomainError.js';
import type { SvgDocument } from '../domain/document/SvgDocument.js';

export class EditorSession {
  #document: SvgDocument | undefined;
  #defaultPath: string | undefined;

  public get document(): SvgDocument | undefined {
    return this.#document;
  }

  public get defaultPath(): string | undefined {
    return this.#defaultPath;
  }

  public open(document: SvgDocument, path?: string): void {
    this.#document = document;
    this.#defaultPath = path;
  }

  public requireDocument(): SvgDocument {
    if (this.#document === undefined) {
      throw new DomainError("no document. use 'init' or 'read' first");
    }

    return this.#document;
  }

  public setDefaultPath(path: string): void {
    this.#defaultPath = path;
  }
}
