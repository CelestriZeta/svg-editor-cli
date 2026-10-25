import { ShapeStyle } from '../shapes/ShapeStyle.js';
import { ShapeSpec } from './ShapeSpec.js';

export class GroupSpec extends ShapeSpec {
  public constructor(id: string, style = new ShapeStyle()) {
    super(id, style);
  }

  public override readonly type = 'g';
}
