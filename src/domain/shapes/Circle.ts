import { DomainError } from '../DomainError.js';
import type { CircleSpec } from '../specs/CircleSpec.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { GeometryValueChange } from './GeometryValueChange.js';
import { Shape } from './Shape.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';

export class Circle extends Shape {
  #cx: number;
  #cy: number;
  #r: number;

  public constructor(spec: CircleSpec) {
    super(spec.id, spec.style);

    if (spec.type !== 'circle') {
      throw new DomainError('invalid circle specification');
    }

    this.#cx = spec.cx;
    this.#cy = spec.cy;
    this.#r = spec.r;
  }

  public override readonly type = 'circle';

  public get cx(): number {
    return this.#cx;
  }

  public get cy(): number {
    return this.#cy;
  }

  public get r(): number {
    return this.#r;
  }

  public override prepareMove(
    dx: number,
    dy: number
  ): GeometryChangeSet {
    Shape.requireMoveDelta(dx, dy);
    const cx = this.#cx + dx;
    const cy = this.#cy + dy;
    Shape.requireFiniteGeometry(
      [cx, cy, this.#r],
      'moved geometry must be finite numbers'
    );
    return GeometryChangeSet.single(this, [
      new GeometryValueChange('cx', this.#cx, cx),
      new GeometryValueChange('cy', this.#cy, cy)
    ]);
  }

  public override prepareScale(factor: number): GeometryChangeSet {
    Shape.requireScaleFactor(factor);
    const cx = this.#cx * factor;
    const cy = this.#cy * factor;
    const r = this.#r * factor;
    Shape.requireFiniteGeometry([
      cx,
      cy,
      r
    ], 'scaled geometry must be finite numbers');
    return GeometryChangeSet.single(this, [
      new GeometryValueChange('cx', this.#cx, cx),
      new GeometryValueChange('cy', this.#cy, cy),
      new GeometryValueChange('r', this.#r, r)
    ]);
  }

  public override accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitCircle(this);
  }

  protected override setOwnAttribute(update: ShapeAttributeUpdate): void {
    switch (update.name) {
      case 'cx':
        this.#cx = update.numericValue;
        return;
      case 'cy':
        this.#cy = update.numericValue;
        return;
      case 'r':
        this.#r = this.requirePositive(update);
        return;
      default:
        throw new DomainError(`unknown attribute: ${update.name}`);
    }
  }

  private requirePositive(update: ShapeAttributeUpdate): number {
    const number = update.numericValue;
    if (number <= 0) {
      throw new DomainError(`${update.name} must be positive`);
    }
    return number;
  }
}
