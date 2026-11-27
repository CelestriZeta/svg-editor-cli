import type { TreeLineContext } from './TreeLineContext.js';

export interface TreeDecorator {
  readonly name: string;

  /** 返回行尾标签，空数组表示不装饰；调用不得修改文档。 */
  labels(context: TreeLineContext): readonly string[];
}
