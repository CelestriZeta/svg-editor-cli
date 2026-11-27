import { ShapeSpec } from './ShapeSpec.js';
import type { Shape } from '../shapes/Shape.js';
import type { ShapeRelations } from '../shapes/ShapeRelations.js';

/** 组合规格而非修改原规格，亦用于以 SVG 实际子节点覆盖创建模板。 */
export class ShapeSpecWithChildren extends ShapeSpec {
  readonly #children: readonly ShapeSpec[];

  public constructor(private readonly source: ShapeSpec, children: readonly ShapeSpec[]) {
    super(source.id, source.style);
    this.#children = Object.freeze([...children]);
  }

  public override get type(): string { return this.source.type; }
  public override get children(): readonly ShapeSpec[] { return this.#children; }

  public create(relations: ShapeRelations): Shape {
    return this.source.create(relations);
  }
}
