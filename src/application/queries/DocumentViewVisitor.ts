import type { Circle } from '../../domain/shapes/Circle.js';
import type { Ellipse } from '../../domain/shapes/Ellipse.js';
import type { Group } from '../../domain/shapes/Group.js';
import type { Line } from '../../domain/shapes/Line.js';
import type { Rect } from '../../domain/shapes/Rect.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import type { Text } from '../../domain/shapes/Text.js';
import { ShapeVisitor } from '../../domain/visitor/ShapeVisitor.js';
import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import { DocumentView } from './DocumentView.js';
import { GeometrySnapshot } from './GeometrySnapshot.js';
import { ShapeAnchor } from './ShapeAnchor.js';
import { ShapeReference } from './ShapeReference.js';
import { ShapeSnapshot } from './ShapeSnapshot.js';

export class DocumentViewVisitor extends ShapeVisitor<ShapeSnapshot> {
  public constructor(private readonly recursive = true) {
    super();
  }

  public visit(document: SvgDocument): DocumentView {
    return new DocumentView(document.width, document.height,
      [...document.children].map((shape) => this.visitSubtree(shape)));
  }

  public visitSubtree(shape: Shape): ShapeSnapshot {
    return shape.accept(this);
  }

  public inspect(shape: Shape): ShapeSnapshot {
    // 单独实例只投影当前节点，避免影响此访问者后续的完整子树查询。
    return new DocumentViewVisitor(false).visitSubtree(shape);
  }

  public enterGroup(): boolean {
    return this.recursive;
  }

  public leaveGroup(group: Group, children: readonly ShapeSnapshot[]): ShapeSnapshot {
    return this.snapshot(group, GeometrySnapshot.empty(), children);
  }

  public visitCircle(circle: Circle): ShapeSnapshot {
    return this.snapshot(circle, GeometrySnapshot.named([
      ['cx', circle.cx], ['cy', circle.cy], ['r', circle.r]
    ], new ShapeAnchor(circle.cx, circle.cy)));
  }

  public visitEllipse(ellipse: Ellipse): ShapeSnapshot {
    return this.snapshot(ellipse, GeometrySnapshot.named([
      ['cx', ellipse.cx], ['cy', ellipse.cy], ['rx', ellipse.rx], ['ry', ellipse.ry]
    ], new ShapeAnchor(ellipse.cx, ellipse.cy)));
  }

  public visitLine(line: Line): ShapeSnapshot {
    return this.snapshot(line, GeometrySnapshot.segment(
      new ShapeAnchor(line.x1, line.y1), new ShapeAnchor(line.x2, line.y2)));
  }

  public visitRect(rect: Rect): ShapeSnapshot {
    return this.snapshot(rect, GeometrySnapshot.named([
      ['x', rect.x], ['y', rect.y], ['width', rect.width], ['height', rect.height]
    ], new ShapeAnchor(rect.x, rect.y)));
  }

  public visitText(text: Text): ShapeSnapshot {
    return this.snapshot(text, GeometrySnapshot.text(new ShapeAnchor(text.x, text.y), text.content));
  }

  private snapshot(shape: Shape, geometry: GeometrySnapshot, children: readonly ShapeSnapshot[] = []): ShapeSnapshot {
    const parent = shape.parent;
    return new ShapeSnapshot(new ShapeReference(shape.type, shape.id), geometry,
      shape.fill, shape.stroke, shape.strokeWidth,
      parent === undefined ? undefined : new ShapeReference(parent.type, parent.id), children);
  }
}
