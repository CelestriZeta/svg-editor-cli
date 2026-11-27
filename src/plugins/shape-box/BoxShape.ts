import { ContainerShape } from '../../domain/shapes/ContainerShape.js';
import type { ShapeRelations } from '../../domain/shapes/ShapeRelations.js';
import { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';
import { Rect } from '../../domain/shapes/Rect.js';
import { Text } from '../../domain/shapes/Text.js';
import { DomainError } from '../../domain/DomainError.js';
export class BoxShape extends ContainerShape {
  public readonly type = 'box';
  public constructor(id: string, relations: ShapeRelations, style = new ShapeStyle()) { super(id, relations, style); }
  public override validateStructure(relations: ShapeRelations): void {
    const children=[...relations.childrenOf(this)];
    if (!(children.find(c=>c.id===this.id+'-rect') instanceof Rect) || !(children.find(c=>c.id===this.id+'-label') instanceof Text)) {
      throw new DomainError('invalid box parts: ' + this.id);
    }
  }
}
