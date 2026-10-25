import type { Rect } from '../../domain/shapes/Rect.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import type { ShapeVisitor } from '../../domain/visitor/ShapeVisitor.js';
import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import { DocumentView } from './DocumentView.js';
import { RectView } from './RectView.js';
import type { ShapeView } from './ShapeView.js';

export class DocumentViewVisitor implements ShapeVisitor<ShapeView> {
  public visit(document: SvgDocument): DocumentView {
    const children: ShapeView[] = [];

    for (const shape of document.children) {
      children.push(this.visitShape(shape));
    }

    return new DocumentView(document.width, document.height, children);
  }

  public visitRect(rect: Rect): RectView {
    return new RectView(
      rect.id,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      rect.fill
    );
  }

  private visitShape(shape: Shape): ShapeView {
    return shape.accept(this);
  }
}
