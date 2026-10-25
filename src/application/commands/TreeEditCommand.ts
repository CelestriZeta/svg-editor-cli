import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ShapeTreeChangeSet } from '../../domain/shapes/ShapeTreeChangeSet.js';
import { EditChangeSetCommand } from './EditChangeSetCommand.js';

export abstract class TreeEditCommand extends EditChangeSetCommand {
  protected constructor(protected readonly document: SvgDocument) {
    super();
  }

  protected abstract override prepareChange(): ShapeTreeChangeSet;
}
