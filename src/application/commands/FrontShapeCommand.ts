import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { CompositeChangeSet } from '../../domain/CompositeChangeSet.js';
import { ReorderShapeCommand } from './ReorderShapeCommand.js';
import { ReorderDirection } from './contracts/ReorderDirection.js';

export class FrontShapeCommand extends ReorderShapeCommand {
  public constructor(document: SvgDocument, shapeId: string) {
    super(document, shapeId);
  }

  protected override get direction(): ReorderDirection {
    return ReorderDirection.Front;
  }

  protected override prepareChange(): CompositeChangeSet {
    return this.document.prepareFront(this.shapeId);
  }
}
