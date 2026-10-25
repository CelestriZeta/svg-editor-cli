import type { ShapeSnapshot } from '../application/queries/ShapeSnapshot.js';
import { ShapeFormatter } from './ShapeFormatter.js';

export class ShowFormatter {
  public constructor(private readonly shapes = new ShapeFormatter()) {}

  public format(shape: ShapeSnapshot): string {
    const parent = shape.parent;
    const parentLabel = parent === undefined ? 'svg' : `${parent.type}#${parent.id}`;
    const lines = [`${this.shapes.label(shape)}  parent=${parentLabel}`];
    const geometry = this.shapes.geometry(shape);
    const style = this.shapes.style(shape);
    if (geometry.length > 0) {
      lines.push(`  ${geometry.join(' ')}`);
    }
    if (style.length > 0) {
      lines.push(`  ${style.join(' ')}`);
    }
    return lines.join('\n');
  }
}
