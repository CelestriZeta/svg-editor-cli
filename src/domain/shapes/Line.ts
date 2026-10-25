import { DomainError } from '../DomainError.js';
import type { LineSpec } from '../specs/LineSpec.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { GeometryValueChange } from './GeometryValueChange.js';
import { Shape } from './Shape.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';

export class Line extends Shape {
  #x1: number;
  #y1: number;
  #x2: number;
  #y2: number;

  public constructor(spec: LineSpec) {
    super(spec.id, spec.style);

    if (spec.type !== 'line') {
      throw new DomainError('invalid line specification');
    }

    this.#x1 = spec.x1;
    this.#y1 = spec.y1;
    this.#x2 = spec.x2;
    this.#y2 = spec.y2;
  }

  public override readonly type = 'line';

  public get x1(): number {
    return this.#x1;
  }

  public get y1(): number {
    return this.#y1;
  }

  public get x2(): number {
    return this.#x2;
  }

  public get y2(): number {
    return this.#y2;
  }

  public override prepareMove(
    dx: number,
    dy: number
  ): GeometryChangeSet {
    Shape.requireMoveDelta(dx, dy);
    const x1 = this.#x1 + dx;
    const y1 = this.#y1 + dy;
    const x2 = this.#x2 + dx;
    const y2 = this.#y2 + dy;
    Shape.requireFiniteGeometry([
      x1,
      y1,
      x2,
      y2
    ], 'moved geometry must be finite numbers');
    return GeometryChangeSet.single(this, [
      new GeometryValueChange('x1', this.#x1, x1),
      new GeometryValueChange('y1', this.#y1, y1),
      new GeometryValueChange('x2', this.#x2, x2),
      new GeometryValueChange('y2', this.#y2, y2)
    ]);
  }

  public override prepareScale(factor: number): GeometryChangeSet {
    Shape.requireScaleFactor(factor);
    const x1 = this.#x1 * factor;
    const y1 = this.#y1 * factor;
    const x2 = this.#x2 * factor;
    const y2 = this.#y2 * factor;
    Shape.requireFiniteGeometry([
      x1,
      y1,
      x2,
      y2
    ], 'scaled geometry must be finite numbers');
    return GeometryChangeSet.single(this, [
      new GeometryValueChange('x1', this.#x1, x1),
      new GeometryValueChange('y1', this.#y1, y1),
      new GeometryValueChange('x2', this.#x2, x2),
      new GeometryValueChange('y2', this.#y2, y2)
    ]);
  }

  public override accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitLine(this);
  }

  protected override setOwnAttribute(update: ShapeAttributeUpdate): void {
    switch (update.name) {
      case 'x1':
        this.#x1 = update.numericValue;
        return;
      case 'y1':
        this.#y1 = update.numericValue;
        return;
      case 'x2':
        this.#x2 = update.numericValue;
        return;
      case 'y2':
        this.#y2 = update.numericValue;
        return;
      default:
        throw new DomainError(`unknown attribute: ${update.name}`);
    }
  }
}
