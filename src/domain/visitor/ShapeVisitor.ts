import type { Rect } from '../shapes/Rect.js';

export interface ShapeVisitor<T> {
  visitRect(rect: Rect): T;
}
