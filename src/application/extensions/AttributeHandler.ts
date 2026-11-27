import type { ShapeSnapshot } from '../queries/ShapeSnapshot.js';
import type { AttributeEditContext } from './AttributeEditContext.js';
import type { PreparedAttributeEdit } from './PreparedAttributeEdit.js';

export interface AttributeHandler {
  readonly name: string;

  /** 只读匹配；不修改文档。 */
  handles(target: ShapeSnapshot, attribute: string): boolean;

  /** 只准备变更；由编辑命令统一提交，处理器不自行执行 apply。 */
  prepare(
    target: ShapeSnapshot,
    attribute: string,
    value: string,
    context: AttributeEditContext
  ): PreparedAttributeEdit;
}
