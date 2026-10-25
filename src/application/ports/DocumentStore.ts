import type { SvgDocument } from '../../domain/document/SvgDocument.js';

export interface DocumentStore {
  save(path: string, document: SvgDocument): Promise<void>;
}
