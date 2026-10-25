import type { DocumentView } from '../application/queries/DocumentView.js';
import type { CircleView } from '../application/queries/CircleView.js';
import type { EllipseView } from '../application/queries/EllipseView.js';
import type { GroupView } from '../application/queries/GroupView.js';
import type { LineView } from '../application/queries/LineView.js';
import type { RectView } from '../application/queries/RectView.js';
import type { ShapeView } from '../application/queries/ShapeView.js';
import { ShapeViewVisitor } from '../application/queries/ShapeViewVisitor.js';
import type { TextView } from '../application/queries/TextView.js';

export class TreeFormatter extends ShapeViewVisitor<string> {
  public format(view: DocumentView): string {
    const lines = [`svg (${view.width}x${view.height})`];
    this.formatChildren(view.children, '', lines);

    return lines.join('\n');
  }

  public visitCircle(circle: CircleView): string {
    return this.withStyle(
      this.label('circle', circle),
      [`cx=${circle.cx}`, `cy=${circle.cy}`, `r=${circle.r}`],
      circle
    );
  }

  public visitEllipse(ellipse: EllipseView): string {
    return this.withStyle(
      this.label('ellipse', ellipse),
      [
        `cx=${ellipse.cx}`,
        `cy=${ellipse.cy}`,
        `rx=${ellipse.rx}`,
        `ry=${ellipse.ry}`
      ],
      ellipse
    );
  }

  public visitGroup(group: GroupView): string {
    return this.withStyle(this.label('g', group), [], group);
  }

  public visitLine(line: LineView): string {
    return this.withStyle(
      this.label('line', line),
      [`(${line.x1},${line.y1}) -> (${line.x2},${line.y2})`],
      line
    );
  }

  public visitRect(rect: RectView): string {
    return this.withStyle(
      this.label('rect', rect),
      [
        `x=${rect.x}`,
        `y=${rect.y}`,
        `w=${rect.width}`,
        `h=${rect.height}`
      ],
      rect
    );
  }

  public visitText(text: TextView): string {
    return this.withStyle(
      this.label('text', text),
      [`(${text.x},${text.y})`, `"${text.content}"`],
      text
    );
  }

  private formatChildren(
    children: readonly ShapeView[],
    prefix: string,
    lines: string[]
  ): void {
    children.forEach((child, index) => {
      const isLast = index === children.length - 1;
      const connector = isLast ? '└──' : '├──';
      lines.push(`${prefix}${connector} ${child.accept(this)}`);
      this.formatChildren(
        child.children,
        `${prefix}${isLast ? '    ' : '│   '}`,
        lines
      );
    });
  }

  private label(type: string, view: ShapeView): string {
    return `${type}#${view.id}`.padEnd(15);
  }

  private withStyle(
    label: string,
    attributes: readonly string[],
    view: ShapeView
  ): string {
    const parts = [...attributes];
    if (view.fill !== undefined) {
      parts.push(`fill=${view.fill}`);
    }
    if (view.stroke !== undefined) {
      parts.push(`stroke=${view.stroke}`);
    }
    if (view.strokeWidth !== undefined) {
      parts.push(`stroke-width=${view.strokeWidth}`);
    }

    return `${label}${parts.join(' ')}`.trimEnd();
  }
}
