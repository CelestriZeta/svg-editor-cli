import { ShapeSpec } from '../../src/domain/specs/ShapeSpec.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import type { ShapeRelations } from '../../src/domain/shapes/ShapeRelations.js';
import { GuardedContainer } from './GuardedContainer.js';

export class GuardedSpec extends ShapeSpec {
  public readonly type = 'guarded';
  readonly #children: readonly ShapeSpec[];

  public constructor(id: string, children: readonly ShapeSpec[] = [new RectSpec(id + '-core', 0, 0, 2, 3)]) {
    super(id);
    this.#children = Object.freeze([...children]);
  }

  public override get children(): readonly ShapeSpec[] { return this.#children; }

  public create(relations: ShapeRelations): GuardedContainer {
    return new GuardedContainer(this.id, relations);
  }
}
