import { DomainError } from '../DomainError.js';
import type { EllipseSpec } from '../specs/EllipseSpec.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { GeometryValueChange } from './GeometryValueChange.js';
import { Shape } from './Shape.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';

export class Ellipse extends Shape {
  #cx: number;
  #cy: number;
  #rx: number;
  #ry: number;

  public constructor(spec: EllipseSpec) {
    super(spec.id, spec.style);

    if (spec.type !== 'ellipse') {
      throw new DomainError('invalid ellipse specification');
    }

    this.#cx = spec.cx;
    this.#cy = spec.cy;
    this.#rx = spec.rx;
    this.#ry = spec.ry;
  }

  public override readonly type = 'ellipse';

  public get cx(): number {
    return this.#cx;
  }

  public get cy(): number {
    return this.#cy;
  }

  public get rx(): number {
    return this.#rx;
  }

  public get ry(): number {
    return this.#ry;
  }

  public override prepareMove(
    dx: number,
    dy: number
  ): GeometryChangeSet {
    Shape.requireMoveDelta(dx, dy);
    const cx = this.#cx + dx;
    const cy = this.#cy + dy;
    Shape.requireFiniteGeometry([
      cx,
      cy,
      this.#rx,
      this.#ry
    ], 'moved geometry must be finite numbers');
    return GeometryChangeSet.single(this, [
      new GeometryValueChange('cx', this.#cx, cx),
      new GeometryValueChange('cy', this.#cy, cy)
    ]);
  }

  public override prepareScale(factor: number): GeometryChangeSet {
    Shape.requireScaleFactor(factor);
    const cx = this.#cx * factor;
    const cy = this.#cy * factor;
    const rx = this.#rx * factor;
    const ry = this.#ry * factor;
    Shape.requireFiniteGeometry([
      cx,
      cy,
      rx,
      ry
    ], 'scaled geometry must be finite numbers');
    return GeometryChangeSet.single(this, [
      new GeometryValueChange('cx', this.#cx, cx),
      new GeometryValueChange('cy', this.#cy, cy),
      new GeometryValueChange('rx', this.#rx, rx),
      new GeometryValueChange('ry', this.#ry, ry)
    ]);
  }

  public override accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitEllipse(this);
  }

  protected override setOwnAttribute(update: ShapeAttributeUpdate): void {
    switch (update.name) {
      case 'cx':
        this.#cx = update.numericValue;
        return;
      case 'cy':
        this.#cy = update.numericValue;
        return;
      case 'rx':
        this.#rx = this.requirePositive(update);
        return;
      case 'ry':
        this.#ry = this.requirePositive(update);
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
