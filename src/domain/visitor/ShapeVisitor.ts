import type { Circle } from '../shapes/Circle.js';
import type { Ellipse } from '../shapes/Ellipse.js';
import type { Group } from '../shapes/Group.js';
import type { Line } from '../shapes/Line.js';
import type { Rect } from '../shapes/Rect.js';
import type { Text } from '../shapes/Text.js';

export abstract class ShapeVisitor<T> {
  public abstract enterGroup(group: Group): boolean;
  public abstract leaveGroup(group: Group, children: readonly T[]): T;
  public abstract visitCircle(circle: Circle): T;
  public abstract visitEllipse(ellipse: Ellipse): T;
  public abstract visitLine(line: Line): T;
  public abstract visitRect(rect: Rect): T;
  public abstract visitText(text: Text): T;
}
