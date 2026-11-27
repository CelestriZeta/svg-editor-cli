import { DomainError } from '../../domain/DomainError.js';
import type { ShapeSnapshot } from '../queries/ShapeSnapshot.js';
import type { AttributeCatalog } from './AttributeCatalog.js';
import type { AttributeEditContext } from './AttributeEditContext.js';
import type { PreparedAttributeEdit } from './PreparedAttributeEdit.js';

export class AttributeResolver {
  public constructor(private readonly catalog?: AttributeCatalog) {}

  public prepare(target: ShapeSnapshot, attribute: string, value: string,
    context: AttributeEditContext, fallback: () => PreparedAttributeEdit): PreparedAttributeEdit {
    const matches = (this.catalog?.attributeHandlers() ?? []).filter((handler) =>
      handler.handles(target, attribute));
    if (matches.length > 1) throw new DomainError(`ambiguous attribute handler: ${attribute}`);
    const edit = matches[0] === undefined ? fallback() : matches[0].prepare(target, attribute, value, Object.freeze(context));
    if (edit === null || typeof edit !== 'object' || typeof edit.readValue !== 'function' ||
      typeof edit.changeSet?.apply !== 'function' || typeof edit.changeSet.revert !== 'function' ||
      typeof edit.changeSet.hasChanges !== 'boolean') {
      throw new DomainError('invalid prepared attribute edit');
    }
    return edit;
  }
}
