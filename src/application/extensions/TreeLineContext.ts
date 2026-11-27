import type { DocumentView } from '../queries/DocumentView.js';
import type { ShapeSnapshot } from '../queries/ShapeSnapshot.js';

/** 没有 shape 时表示画布行；复用只读查询快照，不传入领域写接口。 */
export class TreeLineContext {
  public constructor(
    private readonly documentView: DocumentView,
    private readonly shapeView?: ShapeSnapshot
  ) {
    Object.freeze(this);
  }

  public get document(): DocumentView {
    return this.documentView;
  }

  public get shape(): ShapeSnapshot | undefined {
    return this.shapeView;
  }
}
