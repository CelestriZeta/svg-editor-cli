import { DocumentView } from '../application/queries/DocumentView.js';
import type { ShapeSnapshot } from '../application/queries/ShapeSnapshot.js';
import type { DecoratorCatalog } from '../application/extensions/DecoratorCatalog.js';
import { TreeLineContext } from '../application/extensions/TreeLineContext.js';
import { ShapeFormatter } from './ShapeFormatter.js';

export class TreeFormatter {
  public constructor(private readonly shapes = new ShapeFormatter(),
    private readonly catalog?: DecoratorCatalog, private readonly currentView?: () => DocumentView) {}

  public format(view: DocumentView): string {
    const lines = [this.decorate(`svg (${view.width}x${view.height})`, view)];
    this.formatChildren(view.children, '', lines, view);
    return lines.join('\n');
  }

  public formatSubtree(root: ShapeSnapshot): string {
    const view = this.currentView?.() ?? new DocumentView(0, 0, [root]);
    const lines = [this.decorate(this.shapes.inline(root), view, root)];
    this.formatChildren(root.children, '', lines, view);
    return lines.join('\n');
  }

  private decorate(line: string, view: DocumentView, shape?: ShapeSnapshot): string {
    const context = new TreeLineContext(view, shape);
    const labels = (this.catalog?.treeDecorators() ?? []).flatMap(d => {
      const result = d.labels(context);
      if (!Array.isArray(result) || result.some(v => typeof v !== 'string' || /[\r\n]/.test(v))) {
        throw new Error(`invalid tree labels: ${d.name}`);
      }
      return result.filter(v => v.length > 0);
    });
    return labels.length === 0 ? line : `${line} ${labels.join(' ')}`;
  }

  private formatChildren(children: readonly ShapeSnapshot[], prefix: string, lines: string[], view: DocumentView): void {
    children.forEach((child, index) => {
      const last = index === children.length - 1;
      lines.push(this.decorate(`${prefix}${last ? '└──' : '├──'} ${this.shapes.inline(child)}`, view, child));
      this.formatChildren(child.children, `${prefix}${last ? '    ' : '│   '}`, lines, view);
    });
  }
}
