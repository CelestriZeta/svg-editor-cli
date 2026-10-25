import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { LoadedDocument } from './LoadedDocument.js';

export interface DocumentStore {
  read(path: string): Promise<LoadedDocument>;
  save(path: string, document: SvgDocument): Promise<void>;
}
