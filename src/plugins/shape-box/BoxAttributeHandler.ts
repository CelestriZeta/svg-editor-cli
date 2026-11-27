import type { AttributeHandler } from '../../application/extensions/AttributeHandler.js';
import type { AttributeEditContext } from '../../application/extensions/AttributeEditContext.js';
import type { PreparedAttributeEdit } from '../../application/extensions/PreparedAttributeEdit.js';
import type { ShapeSnapshot } from '../../application/queries/ShapeSnapshot.js';
import { ShapeAttributeUpdate } from '../../domain/shapes/ShapeAttributeUpdate.js';
import { DomainError } from '../../domain/DomainError.js';
export class BoxAttributeHandler implements AttributeHandler {
  public readonly name='box-attributes';
  public handles(target: ShapeSnapshot, attr: string): boolean {return target.kind==='box'&&(attr==='fill'||attr==='label');}
  public prepare(target: ShapeSnapshot, attr: string, value: string, context: AttributeEditContext): PreparedAttributeEdit {
    if(!this.handles(target,attr))throw new DomainError('unsupported box attribute: '+attr);
    const id=target.id+(attr==='fill'?'-rect':'-label'); const attribute=attr==='fill'?'fill':'text';
    return {changeSet:context.prepareSet(id,ShapeAttributeUpdate.text(attribute,value)),readValue:()=>context.readAttribute(id,attribute)};
  }
}
