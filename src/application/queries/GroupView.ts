import { ShapeView } from './ShapeView.js';
import type { ShapeViewVisitor } from './ShapeViewVisitor.js';

export class GroupView extends ShapeView {
  readonly #children: readonly ShapeView[];

  public constructor(
    id: string,
    children: readonly ShapeView[],
    fill?: string,
    stroke?: string,
    strokeWidth?: number
  ) {
    super(id, fill, stroke, strokeWidth);
    this.#children = [...children];
  }

  public override get children(): readonly ShapeView[] {
    return this.#children;
  }

  public override accept<T>(visitor: ShapeViewVisitor<T>): T {
    return visitor.visitGroup(this);
  }
}
