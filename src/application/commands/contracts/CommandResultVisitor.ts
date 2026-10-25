import type { CanvasCreatedResult } from '../results/CanvasCreatedResult.js';
import type { DocumentSavedResult } from '../results/DocumentSavedResult.js';
import type { ErrorResult } from '../results/ErrorResult.js';
import type { GroupCreatedResult } from '../results/GroupCreatedResult.js';
import type { HelpResult } from '../results/HelpResult.js';
import type { ShapeCreatedResult } from '../results/ShapeCreatedResult.js';
import type { ShapeMovedIntoContainerResult } from '../results/ShapeMovedIntoContainerResult.js';
import type { ShapeReorderedResult } from '../results/ShapeReorderedResult.js';
import type { TreeResult } from '../results/TreeResult.js';
import type { UngroupedResult } from '../results/UngroupedResult.js';

export interface CommandResultVisitor<T> {
  visitCanvasCreated(result: CanvasCreatedResult): T;
  visitDocumentSaved(result: DocumentSavedResult): T;
  visitError(result: ErrorResult): T;
  visitGroupCreated(result: GroupCreatedResult): T;
  visitHelp(result: HelpResult): T;
  visitShapeCreated(result: ShapeCreatedResult): T;
  visitShapeMovedIntoContainer(result: ShapeMovedIntoContainerResult): T;
  visitShapeReordered(result: ShapeReorderedResult): T;
  visitTree(result: TreeResult): T;
  visitUngrouped(result: UngroupedResult): T;
}
