import { DomainError } from '../DomainError.js';
import type { ShapeTree } from '../document/ShapeTree.js';
import type { EllipseSpec } from '../specs/EllipseSpec.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { GeometryValueChange } from './GeometryValueChange.js';
import { Shape } from './Shape.js';
import { ShapeAttributeSlot } from './ShapeAttributeSlot.js';
import { ShapeAttributeValue } from './ShapeAttributeValue.js';

export class Ellipse extends Shape {
  #cx: number;
  #cy: number;
  #rx: number;
  #ry: number;
  readonly #attributeSlots: ReadonlyMap<string, ShapeAttributeSlot>;

  public constructor(spec: EllipseSpec, tree: ShapeTree) {
    super(spec.id, tree, spec.style);

    if (spec.type !== 'ellipse') {
      throw new DomainError('invalid ellipse specification');
    }

    this.#cx = spec.cx;
    this.#cy = spec.cy;
    this.#rx = spec.rx;
    this.#ry = spec.ry;
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
        'rx',
        ShapeAttributeSlot.number(
          'rx',
          () => ShapeAttributeValue.number(this.#rx),
          (value) => {
            this.#rx = value.numericValue;
          },
          (value) => this.requirePositive('rx', value)
        )
      ],
      [
        'ry',
        ShapeAttributeSlot.number(
          'ry',
          () => ShapeAttributeValue.number(this.#ry),
          (value) => {
            this.#ry = value.numericValue;
          },
          (value) => this.requirePositive('ry', value)
        )
      ]
    ]);
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
