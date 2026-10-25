import type { DocumentStore } from '../../src/application/ports/DocumentStore.js';
import type { LoadedDocument } from '../../src/application/ports/LoadedDocument.js';
import type { SvgDocument } from '../../src/domain/document/SvgDocument.js';

export class RecordingDocumentStore implements DocumentStore {
  #path: string | undefined;
  #document: SvgDocument | undefined;
  #loaded: LoadedDocument | undefined;

  public async read(_path: string): Promise<LoadedDocument> {
    if (this.#loaded === undefined) {
      throw new Error('no recorded document to read');
    }
    return this.#loaded;
  }

  public async save(path: string, document: SvgDocument): Promise<void> {
    this.#path = path;
    this.#document = document;
  }

  public recordRead(loaded: LoadedDocument): void {
    this.#loaded = loaded;
  }

  public get savedPath(): string | undefined {
    return this.#path;
  }

  public get savedDocument(): SvgDocument | undefined {
    return this.#document;
  }
}
