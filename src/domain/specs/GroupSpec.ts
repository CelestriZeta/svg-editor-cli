import { ShapeSpec } from './ShapeSpec.js';

export class GroupSpec extends ShapeSpec {
  public constructor(id: string) {
    super(id);
  }

  public override readonly type = 'g';
}
