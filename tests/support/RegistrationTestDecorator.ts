import type { TreeDecorator } from '../../src/application/extensions/TreeDecorator.js';
import type { TreeLineContext } from '../../src/application/extensions/TreeLineContext.js';

export class RegistrationTestDecorator implements TreeDecorator {
  public readonly name = 'probe-label';

  public labels(context: TreeLineContext): readonly string[] {
    return [context.shape === undefined ? '(canvas)' : '(shape)'];
  }
}
