import type { CommandResult } from '../application/commands/contracts/CommandResult.js';
import type { CommandResultVisitor } from '../application/commands/contracts/CommandResultVisitor.js';
import type { CanvasCreatedResult } from '../application/commands/results/CanvasCreatedResult.js';
import type { DocumentSavedResult } from '../application/commands/results/DocumentSavedResult.js';
import type { ErrorResult } from '../application/commands/results/ErrorResult.js';
import type { HelpResult } from '../application/commands/results/HelpResult.js';
import type { ShapeCreatedResult } from '../application/commands/results/ShapeCreatedResult.js';
import type { TreeResult } from '../application/commands/results/TreeResult.js';
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
    return `${result.shapeType}#${result.shapeId} created`;
  }

  public visitTree(result: TreeResult): string {
    return this.treeFormatter.format(result.view);
  }
}
