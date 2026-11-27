import { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { ShapeRelations } from '../../domain/shapes/ShapeRelations.js';
import type { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';
import { ArrowShape } from './ArrowShape.js';

export class ArrowSpec extends ShapeSpec {
  public readonly type = 'arrow';
  readonly #children: readonly ShapeSpec[];

  public constructor(id: string, children: readonly ShapeSpec[], style: ShapeStyle) {
    super(id, style);
    this.#children = Object.freeze([...children]);
  }

  public override get children(): readonly ShapeSpec[] { return this.#children; }

  public create(relations: ShapeRelations): ArrowShape {
    return new ArrowShape(this.id, relations, this.style);
  }
}
