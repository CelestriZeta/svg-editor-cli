import { DomainError } from '../DomainError.js';
import type { ShapeTree } from '../document/ShapeTree.js';
import type { LineSpec } from '../specs/LineSpec.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { GeometryValueChange } from './GeometryValueChange.js';
import { Shape } from './Shape.js';
import { ShapeAttributeSlot } from './ShapeAttributeSlot.js';
import { ShapeAttributeValue } from './ShapeAttributeValue.js';

export class Line extends Shape {
  #x1: number;
  #y1: number;
  #x2: number;
  #y2: number;
  readonly #attributeSlots: ReadonlyMap<string, ShapeAttributeSlot>;

  public constructor(spec: LineSpec, tree: ShapeTree) {
    super(spec.id, tree, spec.style);

    if (spec.type !== 'line') {
      throw new DomainError('invalid line specification');
    }

    this.#x1 = spec.x1;
    this.#y1 = spec.y1;
    this.#x2 = spec.x2;
    this.#y2 = spec.y2;
    this.#attributeSlots = new Map<string, ShapeAttributeSlot>([
      [
        'x1',
        ShapeAttributeSlot.number(
          'x1',
          () => ShapeAttributeValue.number(this.#x1),
          (value) => {
            this.#x1 = value.numericValue;
          }
        )
      ],
      [
        'y1',
        ShapeAttributeSlot.number(
          'y1',
          () => ShapeAttributeValue.number(this.#y1),
          (value) => {
            this.#y1 = value.numericValue;
          }
        )
      ],
      [
        'x2',
        ShapeAttributeSlot.number(
          'x2',
          () => ShapeAttributeValue.number(this.#x2),
          (value) => {
            this.#x2 = value.numericValue;
          }
        )
      ],
      [
        'y2',
        ShapeAttributeSlot.number(
          'y2',
          () => ShapeAttributeValue.number(this.#y2),
          (value) => {
            this.#y2 = value.numericValue;
          }
        )
      ]
    ]);
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

  protected override ownAttributeSlot(
    name: string
  ): ShapeAttributeSlot | undefined {
    return this.#attributeSlots.get(name);
  }
}
