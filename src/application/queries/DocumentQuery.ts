import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import type { DocumentView } from './DocumentView.js';
import type { ShapeSnapshot } from './ShapeSnapshot.js';

export interface DocumentQuery {
  visit(document: SvgDocument): DocumentView;
  visitSubtree(shape: Shape): ShapeSnapshot;
  inspect(shape: Shape): ShapeSnapshot;
}
