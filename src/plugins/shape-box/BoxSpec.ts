import { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';
import type { ShapeRelations } from '../../domain/shapes/ShapeRelations.js';
import { BoxShape } from './BoxShape.js';
export class BoxSpec extends ShapeSpec {
  public readonly type = 'box'; readonly #children: readonly ShapeSpec[];
  public constructor(id: string, children: readonly ShapeSpec[] = [], style = new ShapeStyle()) { super(id,style);this.#children=Object.freeze([...children]); }
  public override get children(): readonly ShapeSpec[] {return this.#children;}
  public create(relations: ShapeRelations): BoxShape {return new BoxShape(this.id,relations,this.style);}
}
