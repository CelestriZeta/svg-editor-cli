import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import { ReorderShapeCommand } from './ReorderShapeCommand.js';
import { ReorderDirection } from './results/ReorderDirection.js';

export class FrontShapeCommand extends ReorderShapeCommand {
  public constructor(document: SvgDocument, shapeId: string) {
    super(document, shapeId);
  }

  protected override get direction(): ReorderDirection {
    return ReorderDirection.Front;
  }
}
