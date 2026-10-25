import { DomainError } from '../DomainError.js';
import type { ShapeTree } from '../document/ShapeTree.js';
import type { RectSpec } from '../specs/RectSpec.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { GeometryValueChange } from './GeometryValueChange.js';
import { Shape } from './Shape.js';
import { ShapeAttributeSlot } from './ShapeAttributeSlot.js';
import { ShapeAttributeValue } from './ShapeAttributeValue.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';

export class Rect extends Shape {
  #x: number;
  #y: number;
  #width: number;
  #height: number;
  readonly #attributeSlots: ReadonlyMap<string, ShapeAttributeSlot>;

  public constructor(spec: RectSpec, tree: ShapeTree) {
    super(spec.id, tree, spec.style);

    if (spec.type !== 'rect') {
      throw new DomainError('invalid rect specification');
    }

    this.#x = spec.x;
    this.#y = spec.y;
    this.#width = spec.width;
    this.#height = spec.height;
    this.#attributeSlots = new Map<string, ShapeAttributeSlot>([
      [
        'x',
        ShapeAttributeSlot.number(
          'x',
          () => ShapeAttributeValue.number(this.#x),
          (value) => {
            this.#x = value.numericValue;
          }
        )
      ],
      [
        'y',
        ShapeAttributeSlot.number(
          'y',
          () => ShapeAttributeValue.number(this.#y),
          (value) => {
            this.#y = value.numericValue;
          }
        )
      ],
      [
        'width',
        ShapeAttributeSlot.number(
          'width',
          () => ShapeAttributeValue.number(this.#width),
          (value) => {
            this.#width = value.numericValue;
          },
          (value) => this.requirePositive('width', value)
        )
      ],
      [
        'height',
        ShapeAttributeSlot.number(
          'height',
          () => ShapeAttributeValue.number(this.#height),
          (value) => {
            this.#height = value.numericValue;
          },
          (value) => this.requirePositive('height', value)
        )
      ]
    ]);
  }

  public override readonly type = 'rect';

  public get x(): number {
    return this.#x;
  }

  public get y(): number {
    return this.#y;
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

  public override prepareMove(
    dx: number,
    dy: number
  ): GeometryChangeSet {
    Shape.requireMoveDelta(dx, dy);
    const x = this.#x + dx;
    const y = this.#y + dy;
    Shape.requireFiniteGeometry([
      x,
      y,
      this.#width,
      this.#height
    ], 'moved geometry must be finite numbers');
    return GeometryChangeSet.single(this, [
      new GeometryValueChange('x', this.#x, x),
      new GeometryValueChange('y', this.#y, y)
    ]);
  }

  public override prepareScale(factor: number): GeometryChangeSet {
    Shape.requireScaleFactor(factor);
    const x = this.#x * factor;
    const y = this.#y * factor;
    const width = this.#width * factor;
    const height = this.#height * factor;
    Shape.requireFiniteGeometry([
      x,
      y,
      width,
      height
    ], 'scaled geometry must be finite numbers');
    return GeometryChangeSet.single(this, [
      new GeometryValueChange('x', this.#x, x),
      new GeometryValueChange('y', this.#y, y),
      new GeometryValueChange('width', this.#width, width),
      new GeometryValueChange('height', this.#height, height)
    ]);
  }

  public override accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitRect(this);
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
