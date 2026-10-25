import type { Circle } from '../shapes/Circle.js';
import type { Ellipse } from '../shapes/Ellipse.js';
import type { Group } from '../shapes/Group.js';
import type { Line } from '../shapes/Line.js';
import type { Rect } from '../shapes/Rect.js';
import type { Shape } from '../shapes/Shape.js';
import type { Text } from '../shapes/Text.js';
import { ShapeVisitor } from './ShapeVisitor.js';

export class ShapeCollector extends ShapeVisitor<void> {
  readonly #shapes: Shape[] = [];

  public collect(shape: Shape): readonly Shape[] {
    this.#shapes.length = 0;
    shape.accept(this);
    return [...this.#shapes];
  }

  public enterGroup(group: Group): boolean {
    this.#shapes.push(group);
    return true;
  }

  public leaveGroup(): void {}

  public visitCircle(circle: Circle): void {
    this.#shapes.push(circle);
  }

  public visitEllipse(ellipse: Ellipse): void {
    this.#shapes.push(ellipse);
  }

  public visitLine(line: Line): void {
    this.#shapes.push(line);
  }

  public visitRect(rect: Rect): void {
    this.#shapes.push(rect);
  }

  public visitText(text: Text): void {
    this.#shapes.push(text);
  }
}
