import type { CommandPresenter } from '../../application/commands/contracts/CommandPresenter.js';
import type { DocumentView } from '../../application/queries/DocumentView.js';
import type { ShapeSnapshot } from '../../application/queries/ShapeSnapshot.js';
export class StatsPresenter implements CommandPresenter<DocumentView> {
  public format(view: DocumentView): string {
    const counts = new Map<string, number>(); let containers = 0, total = 0;
    const walk = (shape: ShapeSnapshot): void => {
      if (shape.isContainer) containers++;
      else { counts.set(shape.kind, (counts.get(shape.kind) ?? 0) + 1); total++; }
      shape.children.forEach(walk);
    };
    view.children.forEach(walk);
    return [...counts].map(([type,count]) => type + ': ' + count).concat(['(total ' + total + ', containers ' + containers + ')']).join('  ');
  }
}
