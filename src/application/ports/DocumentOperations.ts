import type { CanvasSize } from '../../domain/document/CanvasSize.js';
import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { LoadedDocument } from './LoadedDocument.js';

export interface DocumentOperations {
  init(width: number, height: number): SvgDocument;
  read(path: string): Promise<LoadedDocument>;
  save(requestedPath?: string): Promise<string>;
  countElements(): number;
  canvasSize(): CanvasSize;
  resizeCanvas(width: number, height: number): CanvasSize;
}
