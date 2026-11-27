import type { AttributeEditContext } from '../../src/application/extensions/AttributeEditContext.js';
import type { AttributeHandler } from '../../src/application/extensions/AttributeHandler.js';
import type { PreparedAttributeEdit } from '../../src/application/extensions/PreparedAttributeEdit.js';
import type { ShapeSnapshot } from '../../src/application/queries/ShapeSnapshot.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';

export class RegistrationTestAttribute implements AttributeHandler {
  public readonly name = 'probe-fill';

  public handles(target: ShapeSnapshot, attribute: string): boolean {
    return target.type === 'rect' && attribute === 'fill';
  }

  public prepare(
    target: ShapeSnapshot,
    attribute: string,
    value: string,
    context: AttributeEditContext
  ): PreparedAttributeEdit {
    return Object.freeze({
      changeSet: context.prepareSet(target.id, ShapeAttributeUpdate.text(attribute, value)),
      readValue: () => context.readAttribute(target.id, attribute)
    });
  }
}
