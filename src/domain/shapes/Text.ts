import { DomainError } from '../DomainError.js';
import type { ShapeTree } from '../document/ShapeTree.js';
import type { TextSpec } from '../specs/TextSpec.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { GeometryValueChange } from './GeometryValueChange.js';
import { Shape } from './Shape.js';
import { ShapeAttributeSlot } from './ShapeAttributeSlot.js';
import { ShapeAttributeValue } from './ShapeAttributeValue.js';

export class Text extends Shape {
  #x: number;
  #y: number;
  #content: string;
  readonly #attributeSlots: ReadonlyMap<string, ShapeAttributeSlot>;

  public constructor(spec: TextSpec, tree: ShapeTree) {
    super(spec.id, tree, spec.style);

    if (spec.type !== 'text') {
      throw new DomainError('invalid text specification');
    }

    this.#x = spec.x;
    this.#y = spec.y;
    this.#content = spec.content;
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
        'text',
        ShapeAttributeSlot.text(
          'text',
          () => ShapeAttributeValue.text(this.#content),
          (value) => {
            this.#content = value.textValue;
          },
          (value) => {
            if (value.length === 0) {
              throw new DomainError('text must not be empty');
            }
          }
        )
      ]
    ]);
  }

  public override readonly type = 'text';

  public get x(): number {
    return this.#x;
  }

  public get y(): number {
    return this.#y;
  }

  public get content(): string {
    return this.#content;
  }

  public override prepareMove(
    dx: number,
    dy: number
  ): GeometryChangeSet {
    Shape.requireMoveDelta(dx, dy);
    const x = this.#x + dx;
    const y = this.#y + dy;
    Shape.requireFiniteGeometry(
      [x, y],
      'moved geometry must be finite numbers'
    );
    return GeometryChangeSet.single(this, [
      new GeometryValueChange('x', this.#x, x),
      new GeometryValueChange('y', this.#y, y)
    ]);
  }

  public override prepareScale(factor: number): GeometryChangeSet {
    Shape.requireScaleFactor(factor);
    const x = this.#x * factor;
    const y = this.#y * factor;
    Shape.requireFiniteGeometry(
      [x, y],
      'scaled geometry must be finite numbers'
    );
    return GeometryChangeSet.single(this, [
      new GeometryValueChange('x', this.#x, x),
      new GeometryValueChange('y', this.#y, y)
    ]);
  }

  public override accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitText(this);
  }

  protected override ownAttributeSlot(
    name: string
  ): ShapeAttributeSlot | undefined {
    return this.#attributeSlots.get(name);
  }
}
