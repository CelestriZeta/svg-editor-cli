import type { ChangeSet } from '../../domain/ChangeSet.js';
import type { ShapeAttributeUpdate } from '../../domain/shapes/ShapeAttributeUpdate.js';
import type { ShapeAttributeValue } from '../../domain/shapes/ShapeAttributeValue.js';

/** 只允许准备类型化属性变更及读取结果，不暴露可写文档或内部树。 */
export interface AttributeEditContext {
  prepareSet(shapeId: string, update: ShapeAttributeUpdate): ChangeSet;

  readAttribute(shapeId: string, attribute: string): ShapeAttributeValue;
}
