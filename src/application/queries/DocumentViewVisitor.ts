import type { Circle } from '../../domain/shapes/Circle.js';
import type { Ellipse } from '../../domain/shapes/Ellipse.js';
import type { Group } from '../../domain/shapes/Group.js';
import type { Line } from '../../domain/shapes/Line.js';
import type { Rect } from '../../domain/shapes/Rect.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import type { Text } from '../../domain/shapes/Text.js';
import { ShapeVisitor } from '../../domain/visitor/ShapeVisitor.js';
import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import { CircleView } from './CircleView.js';
import { DocumentView } from './DocumentView.js';
import { EllipseView } from './EllipseView.js';
import { GroupView } from './GroupView.js';
import { LineView } from './LineView.js';
import { RectView } from './RectView.js';
import type { ShapeView } from './ShapeView.js';
import { TextView } from './TextView.js';

export class DocumentViewVisitor extends ShapeVisitor<ShapeView> {
  public visit(document: SvgDocument): DocumentView {
    const children: ShapeView[] = [];

    for (const shape of document.children) {
      children.push(this.visitShape(shape));
    }

    return new DocumentView(document.width, document.height, children);
  }

  public enterGroup(): boolean {
    return true;
  }

  public leaveGroup(group: Group, children: readonly ShapeView[]): GroupView {
    return new GroupView(
      group.id,
      children,
      group.fill,
      group.stroke,
      group.strokeWidth
    );
  }

  public visitCircle(circle: Circle): CircleView {
    return new CircleView(
      circle.id,
      circle.cx,
      circle.cy,
      circle.r,
      circle.fill,
      circle.stroke,
      circle.strokeWidth
    );
  }

  public visitEllipse(ellipse: Ellipse): EllipseView {
    return new EllipseView(
      ellipse.id,
      ellipse.cx,
      ellipse.cy,
      ellipse.rx,
      ellipse.ry,
      ellipse.fill,
      ellipse.stroke,
      ellipse.strokeWidth
    );
  }

  public visitLine(line: Line): LineView {
    return new LineView(
      line.id,
      line.x1,
      line.y1,
      line.x2,
      line.y2,
      line.fill,
      line.stroke,
      line.strokeWidth
    );
  }

  public visitRect(rect: Rect): RectView {
    return new RectView(
      rect.id,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      rect.fill,
      rect.stroke,
      rect.strokeWidth
    );
  }

  public visitText(text: Text): TextView {
    return new TextView(
      text.id,
      text.x,
      text.y,
      text.content,
      text.fill,
      text.stroke,
      text.strokeWidth
    );
  }

  private visitShape(shape: Shape): ShapeView {
    return shape.accept(this);
  }
}
