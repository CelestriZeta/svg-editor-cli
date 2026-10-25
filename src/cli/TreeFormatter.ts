import type { DocumentView } from '../application/queries/DocumentView.js';
import type { ShapeSnapshot } from '../application/queries/ShapeSnapshot.js';
import { ShapeFormatter } from './ShapeFormatter.js';

export class TreeFormatter {
  public constructor(
    private readonly shapes = new ShapeFormatter()
  ) {}

  public format(view: DocumentView): string {
    const lines = [`svg (${view.width}x${view.height})`];
    this.formatChildren(view.children, '', lines);

    return lines.join('\n');
  }

  public formatSubtree(root: ShapeSnapshot): string {
    const lines = [this.shapes.inline(root)];
    this.formatChildren(root.children, '', lines);
    return lines.join('\n');
  }

  private formatChildren(
    children: readonly ShapeSnapshot[],
    prefix: string,
    lines: string[]
  ): void {
    children.forEach((child, index) => {
      const isLast = index === children.length - 1;
      const connector = isLast ? '└──' : '├──';
      lines.push(`${prefix}${connector} ${this.shapes.inline(child)}`);
      this.formatChildren(
        child.children,
        `${prefix}${isLast ? '    ' : '│   '}`,
        lines
      );
    });
  }
}
