import type { CommandResult } from '../application/commands/contracts/CommandResult.js';
import type { CommandResultVisitor } from '../application/commands/contracts/CommandResultVisitor.js';
import type { CanvasCreatedResult } from '../application/commands/results/CanvasCreatedResult.js';
import type { DocumentSavedResult } from '../application/commands/results/DocumentSavedResult.js';
import type { ErrorResult } from '../application/commands/results/ErrorResult.js';
import type { GroupCreatedResult } from '../application/commands/results/GroupCreatedResult.js';
import type { HelpResult } from '../application/commands/results/HelpResult.js';
import { ReorderDirection } from '../application/commands/results/ReorderDirection.js';
import type { ShapeCreatedResult } from '../application/commands/results/ShapeCreatedResult.js';
import type { ShapeMovedIntoContainerResult } from '../application/commands/results/ShapeMovedIntoContainerResult.js';
import type { ShapeReorderedResult } from '../application/commands/results/ShapeReorderedResult.js';
import type { TreeResult } from '../application/commands/results/TreeResult.js';
import type { UngroupedResult } from '../application/commands/results/UngroupedResult.js';
import type { TreeFormatter } from './TreeFormatter.js';

export class OutputFormatter implements CommandResultVisitor<string> {
  public constructor(private readonly treeFormatter: TreeFormatter) {}

  public format(result: CommandResult): string {
    return result.accept(this);
  }

  public visitError(result: ErrorResult): string {
    return `error: ${result.text}`;
  }

  public visitCanvasCreated(result: CanvasCreatedResult): string {
    return `canvas ${result.width}x${result.height} created`;
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
    const parent =
      result.parentId === undefined ? '' : ` in g#${result.parentId}`;
    return `${result.shapeType}#${result.shapeId} created${parent}`;
  }

  public visitGroupCreated(result: GroupCreatedResult): string {
    return `g#${result.shapeId} created with ${this.childCount(result.childCount)}`;
  }

  public visitUngrouped(result: UngroupedResult): string {
    return `g#${result.shapeId} ungrouped with ${this.childCount(result.childCount)}`;
  }

  public visitShapeMovedIntoContainer(
    result: ShapeMovedIntoContainerResult
  ): string {
    const shape = `${result.shapeType}#${result.shapeId}`;
    return result.changed
      ? `${shape} moved into g#${result.containerId}`
      : `${shape} already in g#${result.containerId}`;
  }

  public visitShapeReordered(result: ShapeReorderedResult): string {
    const shape = `${result.shapeType}#${result.shapeId}`;
    const direction =
      result.direction === ReorderDirection.Front ? 'front' : 'back';
    return result.changed
      ? `${shape} moved to ${direction}`
      : `${shape} already at ${direction}`;
  }

  public visitTree(result: TreeResult): string {
    return this.treeFormatter.format(result.view);
  }

  private childCount(count: number): string {
    return `${count} ${count === 1 ? 'child' : 'children'}`;
  }
}
