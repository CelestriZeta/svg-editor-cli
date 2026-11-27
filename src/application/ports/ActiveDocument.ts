import type { SvgDocument } from '../../domain/document/SvgDocument.js';

export interface ActiveDocument {
  requireDocument(): SvgDocument;
}
