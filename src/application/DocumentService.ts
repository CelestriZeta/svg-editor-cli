import { DomainError } from '../domain/DomainError.js';
import type { CanvasSize } from '../domain/document/CanvasSize.js';
import { SvgDocument } from '../domain/document/SvgDocument.js';
import type { EditorSession } from './EditorSession.js';
import type { DocumentStore } from './ports/DocumentStore.js';
import { DocumentReadError } from './ports/DocumentReadError.js';
import { DocumentStoreError } from './ports/DocumentStoreError.js';
import type { LoadedDocument } from './ports/LoadedDocument.js';

export class DocumentService {
  public constructor(
    private readonly session: EditorSession,
    private readonly store: DocumentStore
  ) {}

  public init(width: number, height: number): SvgDocument {
    const document = new SvgDocument(width, height);
    this.session.open(document);
    return document;
  }

  public async read(path: string): Promise<LoadedDocument> {
    if (path.length === 0) {
      throw new DomainError('read requires a file path');
    }

    let loaded: LoadedDocument;
    try {
      loaded = await this.store.read(path);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      if (error instanceof DocumentReadError) {
        throw error;
      }
      throw new DocumentReadError(path, error);
    }

    this.session.open(loaded.document, path);
    return loaded;
  }

  public async save(requestedPath?: string): Promise<string> {
    const document = this.session.requireDocument();
    const path = requestedPath ?? this.session.defaultPath;

    if (path === undefined || path.length === 0) {
      throw new DomainError("no file path; use 'save <file.svg>'");
    }

    try {
      await this.store.save(path, document);
    } catch (error) {
      throw new DocumentStoreError(path, error);
    }

    this.session.setDefaultPath(path);
    return path;
  }

  public countElements(): number {
    return this.session.requireDocument().elementCount;
  }

  public canvasSize(): CanvasSize {
    return this.session.requireDocument().canvasSize;
  }

  public resizeCanvas(width: number, height: number): CanvasSize {
    return this.session.requireDocument().resizeCanvas(width, height);
  }
}
