import { ShapeSpec } from '../../src/domain/specs/ShapeSpec.js';
import type { ShapeRelations } from '../../src/domain/shapes/ShapeRelations.js';
import { MarkedGroup } from './MarkedGroup.js';

export class MarkedGroupSpec extends ShapeSpec {
  public readonly type = 'marked';

  public constructor(id: string) {
    super(id);
  }

  public create(relations: ShapeRelations): MarkedGroup {
    return new MarkedGroup(this, relations);
  }
}
