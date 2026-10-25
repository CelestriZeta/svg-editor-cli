import type { Circle } from '../../domain/shapes/Circle.js';
import type { Ellipse } from '../../domain/shapes/Ellipse.js';
import type { Group } from '../../domain/shapes/Group.js';
import type { Line } from '../../domain/shapes/Line.js';
import type { Rect } from '../../domain/shapes/Rect.js';
import type { Text } from '../../domain/shapes/Text.js';
import { ShapeVisitor } from '../../domain/visitor/ShapeVisitor.js';
import { ShapeAnchor } from './ShapeAnchor.js';

export class ShapeAnchorProjector extends ShapeVisitor<
  ShapeAnchor | undefined
> {
  public enterGroup(): boolean {
    return false;
  }

  public leaveGroup(): undefined {
    return undefined;
  }

  public visitCircle(circle: Circle): ShapeAnchor {
    return new ShapeAnchor(circle.cx, circle.cy);
  }

  public visitEllipse(ellipse: Ellipse): ShapeAnchor {
    return new ShapeAnchor(ellipse.cx, ellipse.cy);
  }

  public visitLine(line: Line): ShapeAnchor {
    return new ShapeAnchor(line.x1, line.y1);
  }

  public visitRect(rect: Rect): ShapeAnchor {
    return new ShapeAnchor(rect.x, rect.y);
  }

  public visitText(text: Text): ShapeAnchor {
    return new ShapeAnchor(text.x, text.y);
  }
}
