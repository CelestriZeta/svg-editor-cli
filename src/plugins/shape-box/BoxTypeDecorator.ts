import type { TreeDecorator } from '../../application/extensions/TreeDecorator.js';
import type { TreeLineContext } from '../../application/extensions/TreeLineContext.js';
export class BoxTypeDecorator implements TreeDecorator {
  public readonly name='box-type-label';
  public labels(context: TreeLineContext): readonly string[] {return context.shape?.kind==='box'?['(box)']:[];}
}
