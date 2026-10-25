import type { DocumentStore } from '../../src/application/ports/DocumentStore.js';
import type { SvgDocument } from '../../src/domain/document/SvgDocument.js';

export class RecordingDocumentStore implements DocumentStore {
  #path: string | undefined;
  #document: SvgDocument | undefined;

  public async save(path: string, document: SvgDocument): Promise<void> {
    this.#path = path;
    this.#document = document;
  }

  public get savedPath(): string | undefined {
    return this.#path;
  }

  public get savedDocument(): SvgDocument | undefined {
    return this.#document;
  }
}
