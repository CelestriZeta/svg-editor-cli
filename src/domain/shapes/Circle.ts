import { DomainError } from '../DomainError.js';
import type { ShapeTree } from '../document/ShapeTree.js';
import type { CircleSpec } from '../specs/CircleSpec.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { GeometryValueChange } from './GeometryValueChange.js';
import { Shape } from './Shape.js';
import { ShapeAttributeSlot } from './ShapeAttributeSlot.js';
import { ShapeAttributeValue } from './ShapeAttributeValue.js';

export class Circle extends Shape {
  #cx: number;
  #cy: number;
  #r: number;
  readonly #attributeSlots: ReadonlyMap<string, ShapeAttributeSlot>;

  public constructor(spec: CircleSpec, tree: ShapeTree) {
    super(spec.id, tree, spec.style);

    if (spec.type !== 'circle') {
      throw new DomainError('invalid circle specification');
    }

    this.#cx = spec.cx;
    this.#cy = spec.cy;
    this.#r = spec.r;
    this.#attributeSlots = new Map<string, ShapeAttributeSlot>([
      [
        'cx',
        ShapeAttributeSlot.number(
          'cx',
          () => ShapeAttributeValue.number(this.#cx),
          (value) => {
            this.#cx = value.numericValue;
          }
        )
      ],
      [
        'cy',
        ShapeAttributeSlot.number(
          'cy',
          () => ShapeAttributeValue.number(this.#cy),
          (value) => {
            this.#cy = value.numericValue;
          }
        )
      ],
      [
        'r',
        ShapeAttributeSlot.number(
          'r',
          () => ShapeAttributeValue.number(this.#r),
          (value) => {
            this.#r = value.numericValue;
          },
          (value) => this.requirePositive('r', value)
        )
      ]
    ]);
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

  protected override ownAttributeSlot(
    name: string
  ): ShapeAttributeSlot | undefined {
    return this.#attributeSlots.get(name);
  }

  private requirePositive(name: string, value: number): void {
    if (value <= 0) {
      throw new DomainError(`${name} must be positive`);
    }
  }
}
