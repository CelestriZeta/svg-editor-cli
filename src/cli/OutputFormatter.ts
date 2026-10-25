import type { CommandResult } from '../application/commands/contracts/CommandResult.js';
import type { CommandResultVisitor } from '../application/commands/contracts/CommandResultVisitor.js';
import { ReorderDirection } from '../application/commands/contracts/ReorderDirection.js';
import type { CanvasCreatedResult } from '../application/commands/results/CanvasCreatedResult.js';
import type { CanvasResizedResult } from '../application/commands/results/CanvasResizedResult.js';
import type { CanvasResult } from '../application/commands/results/CanvasResult.js';
import type { DocumentReadResult } from '../application/commands/results/DocumentReadResult.js';
import type { DocumentSavedResult } from '../application/commands/results/DocumentSavedResult.js';
import type { ErrorResult } from '../application/commands/results/ErrorResult.js';
import type { GroupCreatedResult } from '../application/commands/results/GroupCreatedResult.js';
import type { HelpResult } from '../application/commands/results/HelpResult.js';
import { EditDirection } from '../application/commands/results/EditDirection.js';
import type { ShapeAnchor } from '../application/queries/ShapeAnchor.js';
import type { ShapeAttributeSetResult } from '../application/commands/results/ShapeAttributeSetResult.js';
import { ShapeAttributeSnapshotKind } from '../application/commands/results/ShapeAttributeSnapshot.js';
import type { ShapeCreatedResult } from '../application/commands/results/ShapeCreatedResult.js';
import type { ShapeDeletedResult } from '../application/commands/results/ShapeDeletedResult.js';
import type { ShapeDetailsResult } from '../application/commands/results/ShapeDetailsResult.js';
import type { ShapeMovedResult } from '../application/commands/results/ShapeMovedResult.js';
import type { ShapeMovedIntoContainerResult } from '../application/commands/results/ShapeMovedIntoContainerResult.js';
import type { ShapeReorderedResult } from '../application/commands/results/ShapeReorderedResult.js';
import type { ShapeScaledResult } from '../application/commands/results/ShapeScaledResult.js';
import type { TreeResult } from '../application/commands/results/TreeResult.js';
import type { TreeSubtreeResult } from '../application/commands/results/TreeSubtreeResult.js';
import type { UngroupedResult } from '../application/commands/results/UngroupedResult.js';
import type { ShowFormatter } from './ShowFormatter.js';
import type { TreeFormatter } from './TreeFormatter.js';

export class OutputFormatter implements CommandResultVisitor<string> {
  public constructor(
    private readonly treeFormatter: TreeFormatter,
    private readonly showFormatter: ShowFormatter
  ) {}

  public format(result: CommandResult): string {
    return result.accept(this);
  }

  public visitError(result: ErrorResult): string {
    return `error: ${result.text}`;
  }

  public visitCanvasCreated(result: CanvasCreatedResult): string {
    return `canvas ${result.width}x${result.height} created`;
  }

  public visitCanvas(result: CanvasResult): string {
    return `canvas ${result.width}x${result.height}`;
  }

  public visitCanvasResized(result: CanvasResizedResult): string {
    return `canvas resized to ${result.width}x${result.height}`;
  }

  public visitDocumentRead(result: DocumentReadResult): string {
    const warnings = result.assignedIds.map(
      (assignment) =>
        `warning: assigned id ${assignment.id} to unnamed <${assignment.tagName}>`
    );
    const suffix = result.elementCount === 1 ? 'element' : 'elements';
    return [
      ...warnings,
      `read ${result.path} (${result.elementCount} ${suffix})`
    ].join('\n');
  }

  public visitDocumentSaved(result: DocumentSavedResult): string {
    const suffix = result.elementCount === 1 ? 'element' : 'elements';
    return `saved to ${result.path} (${result.elementCount} ${suffix})`;
  }

  public visitHelp(result: HelpResult): string {
    return [
      'commands:',
      ...result.syntaxes.map((syntax) => `  ${syntax}`)
    ].join('\n');
  }

  public visitShapeCreated(result: ShapeCreatedResult): string {
    const shape = `${result.shapeType}#${result.shapeId}`;
    if (result.editDirection === EditDirection.Undone) {
      return `${shape} creation undone`;
    }
    const parent =
      result.parentId === undefined ? '' : ` in g#${result.parentId}`;
    return `${shape} created${parent}`;
  }

  public visitGroupCreated(result: GroupCreatedResult): string {
    if (result.editDirection === EditDirection.Undone) {
      return `g#${result.shapeId} grouping undone`;
    }
    return `g#${result.shapeId} created with ${this.childCount(result.childCount)}`;
  }

  public visitUngrouped(result: UngroupedResult): string {
    if (result.editDirection === EditDirection.Undone) {
      return `g#${result.shapeId} regrouped with ${this.childCount(result.childCount)}`;
    }
    return `g#${result.shapeId} ungrouped with ${this.childCount(result.childCount)}`;
  }

  public visitShapeMovedIntoContainer(
    result: ShapeMovedIntoContainerResult
  ): string {
    const shape = `${result.shapeType}#${result.shapeId}`;
    if (result.editDirection === EditDirection.Undone) {
      return `${shape} moved back from g#${result.containerId}`;
    }
    return result.changed
      ? `${shape} moved into g#${result.containerId}`
      : `${shape} already in g#${result.containerId}`;
  }

  public visitShapeReordered(result: ShapeReorderedResult): string {
    const shape = `${result.shapeType}#${result.shapeId}`;
    const direction =
      result.direction === ReorderDirection.Front ? 'front' : 'back';
    if (result.editDirection === EditDirection.Undone) {
      return `${shape} ${direction} order undone`;
    }
    return result.changed
      ? `${shape} moved to ${direction}`
      : `${shape} already at ${direction}`;
  }

  public visitShapeDeleted(result: ShapeDeletedResult): string {
    const shape = `${result.shapeType}#${result.shapeId}`;
    if (result.editDirection !== EditDirection.Undone) {
      return `${shape} deleted`;
    }
    const parent =
      result.parentId === undefined ? '' : ` into g#${result.parentId}`;
    return `${shape} restored${parent}`;
  }

  public visitShapeDetails(result: ShapeDetailsResult): string {
    return this.showFormatter.format(result.details);
  }

  public visitShapeMoved(result: ShapeMovedResult): string {
    const shape = `${result.shapeType}#${result.shapeId}`;
    const undone = result.editDirection === EditDirection.Undone;
    if (result.anchor !== undefined) {
      return `${shape} ${undone ? 'moved back to' : 'moved to'} ${this.anchor(result.anchor)}`;
    }
    return `${shape} ${undone ? 'moved back by' : 'moved by'} (${result.dx},${result.dy})`;
  }

  public visitShapeScaled(result: ShapeScaledResult): string {
    const shape = `${result.shapeType}#${result.shapeId}`;
    if (result.editDirection === EditDirection.Undone) {
      const position =
        result.anchor === undefined ? '' : ` to ${this.anchor(result.anchor)}`;
      return `${shape} scale undone${position}`;
    }
    const position =
      result.anchor === undefined ? '' : ` to ${this.anchor(result.anchor)}`;
    return `${shape} scaled by ${result.factor}${position}`;
  }

  public visitShapeAttributeSet(result: ShapeAttributeSetResult): string {
    return `${result.shapeType}#${result.shapeId} updated: ${this.attributeValue(result)}`;
  }

  public visitTree(result: TreeResult): string {
    return this.treeFormatter.format(result.view);
  }

  public visitTreeSubtree(result: TreeSubtreeResult): string {
    return this.treeFormatter.formatSubtree(result.root);
  }

  private childCount(count: number): string {
    return `${count} ${count === 1 ? 'child' : 'children'}`;
  }

  private anchor(anchor: ShapeAnchor): string {
    return `(${anchor.x},${anchor.y})`;
  }

  private attributeValue(result: ShapeAttributeSetResult): string {
    const value = result.value;
    switch (value.kind) {
      case ShapeAttributeSnapshotKind.Absent:
        return `${result.attribute} unset`;
      case ShapeAttributeSnapshotKind.Number:
        return `${result.attribute}=${value.numericValue}`;
      case ShapeAttributeSnapshotKind.Text:
        return `${result.attribute}=${result.attribute === 'text'
          ? `"${value.textValue}"`
          : value.textValue}`;
    }
  }
}
