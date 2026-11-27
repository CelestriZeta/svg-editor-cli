import type { ChangeSet } from '../../domain/ChangeSet.js';
import type { ShapeAttributeValue } from '../../domain/shapes/ShapeAttributeValue.js';

export interface PreparedAttributeEdit {
  readonly changeSet: ChangeSet;

  /** 在提交、撤销或重做后读取当前语义值，亦可表达便利属性。 */
  readValue(): ShapeAttributeValue;
}
