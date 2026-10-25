import type { DocumentView } from '../application/queries/DocumentView.js';
import type { RectView } from '../application/queries/RectView.js';
import type { ShapeViewVisitor } from '../application/queries/ShapeViewVisitor.js';

export class TreeFormatter implements ShapeViewVisitor<string> {
  public format(view: DocumentView): string {
    const lines = [`svg (${view.width}x${view.height})`];

    view.children.forEach((child, index) => {
      const connector = index === view.children.length - 1 ? '└──' : '├──';
      lines.push(`${connector} ${child.accept(this)}`);
    });

    return lines.join('\n');
  }

  public visitRect(rect: RectView): string {
    const label = `rect#${rect.id}`.padEnd(15);
    const attributes = [
      `x=${rect.x}`,
      `y=${rect.y}`,
      `w=${rect.width}`,
      `h=${rect.height}`
    ];

    if (rect.fill !== undefined) {
      attributes.push(`fill=${rect.fill}`);
    }

    return `${label}${attributes.join(' ')}`;
  }
}
