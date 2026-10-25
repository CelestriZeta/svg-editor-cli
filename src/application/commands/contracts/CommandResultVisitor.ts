import type { CanvasCreatedResult } from '../results/CanvasCreatedResult.js';
import type { CanvasResizedResult } from '../results/CanvasResizedResult.js';
import type { CanvasResult } from '../results/CanvasResult.js';
import type { DocumentReadResult } from '../results/DocumentReadResult.js';
import type { DocumentSavedResult } from '../results/DocumentSavedResult.js';
import type { ErrorResult } from '../results/ErrorResult.js';
import type { GroupCreatedResult } from '../results/GroupCreatedResult.js';
import type { HelpResult } from '../results/HelpResult.js';
import type { ShapeAttributeSetResult } from '../results/ShapeAttributeSetResult.js';
import type { ShapeCreatedResult } from '../results/ShapeCreatedResult.js';
import type { ShapeDeletedResult } from '../results/ShapeDeletedResult.js';
import type { ShapeMovedResult } from '../results/ShapeMovedResult.js';
import type { ShapeMovedIntoContainerResult } from '../results/ShapeMovedIntoContainerResult.js';
import type { ShapeReorderedResult } from '../results/ShapeReorderedResult.js';
import type { ShapeScaledResult } from '../results/ShapeScaledResult.js';
import type { TreeResult } from '../results/TreeResult.js';
import type { UngroupedResult } from '../results/UngroupedResult.js';

export interface CommandResultVisitor<T> {
  visitCanvas(result: CanvasResult): T;
  visitCanvasCreated(result: CanvasCreatedResult): T;
  visitCanvasResized(result: CanvasResizedResult): T;
  visitDocumentRead(result: DocumentReadResult): T;
  visitDocumentSaved(result: DocumentSavedResult): T;
  visitError(result: ErrorResult): T;
  visitGroupCreated(result: GroupCreatedResult): T;
  visitHelp(result: HelpResult): T;
  visitShapeAttributeSet(result: ShapeAttributeSetResult): T;
  visitShapeCreated(result: ShapeCreatedResult): T;
  visitShapeDeleted(result: ShapeDeletedResult): T;
  visitShapeMoved(result: ShapeMovedResult): T;
  visitShapeMovedIntoContainer(result: ShapeMovedIntoContainerResult): T;
  visitShapeReordered(result: ShapeReorderedResult): T;
  visitShapeScaled(result: ShapeScaledResult): T;
  visitTree(result: TreeResult): T;
  visitUngrouped(result: UngroupedResult): T;
}
