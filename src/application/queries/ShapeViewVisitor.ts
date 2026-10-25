import type { RectView } from './RectView.js';

export interface ShapeViewVisitor<T> {
  visitRect(view: RectView): T;
}
