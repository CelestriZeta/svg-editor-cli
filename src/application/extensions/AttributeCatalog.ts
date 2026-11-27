import type { AttributeHandler } from './AttributeHandler.js';

export interface AttributeCatalog {
  attributeHandlers(): readonly AttributeHandler[];
}
