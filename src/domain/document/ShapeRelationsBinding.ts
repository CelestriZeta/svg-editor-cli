import type { ShapeRelations } from '../shapes/ShapeRelations.js';

/** 图形只持有只读门面；连接后释放对创建候选关系的引用。 */
export class ShapeRelationsBinding {
  readonly #view: ShapeRelations;

  public constructor(private current: ShapeRelations) {
    this.#view = Object.freeze({
      parentOf: (shape) => this.current.parentOf(shape),
      childrenOf: (parent) => this.current.childrenOf(parent)
    } satisfies ShapeRelations);
  }

  public get view(): ShapeRelations { return this.#view; }
  public connect(relations: ShapeRelations): void { this.current = relations; }
}
