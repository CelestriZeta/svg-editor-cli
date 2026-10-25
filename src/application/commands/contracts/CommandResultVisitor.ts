import type { CanvasCreatedResult } from '../results/CanvasCreatedResult.js';
import type { DocumentSavedResult } from '../results/DocumentSavedResult.js';
import type { ErrorResult } from '../results/ErrorResult.js';
import type { HelpResult } from '../results/HelpResult.js';
import type { ShapeCreatedResult } from '../results/ShapeCreatedResult.js';
import type { TreeResult } from '../results/TreeResult.js';

export interface CommandResultVisitor<T> {
  visitCanvasCreated(result: CanvasCreatedResult): T;
  visitDocumentSaved(result: DocumentSavedResult): T;
  visitError(result: ErrorResult): T;
  visitHelp(result: HelpResult): T;
  visitShapeCreated(result: ShapeCreatedResult): T;
  visitTree(result: TreeResult): T;
}
