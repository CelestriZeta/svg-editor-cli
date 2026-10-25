import { DomainError } from '../DomainError.js';
import type { TextSpec } from '../specs/TextSpec.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { GeometryValueChange } from './GeometryValueChange.js';
import { Shape } from './Shape.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';

export class Text extends Shape {
  #x: number;
  #y: number;
  #content: string;

  public constructor(spec: TextSpec) {
    super(spec.id, spec.style);

    if (spec.type !== 'text') {
      throw new DomainError('invalid text specification');
    }

    this.#x = spec.x;
    this.#y = spec.y;
    this.#content = spec.content;
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

  protected override setOwnAttribute(update: ShapeAttributeUpdate): void {
    switch (update.name) {
      case 'x':
        this.#x = update.numericValue;
        return;
      case 'y':
        this.#y = update.numericValue;
        return;
      case 'text': {
        const text = update.textValue;
        if (text.length === 0) {
          throw new DomainError('text must not be empty');
        }
        this.#content = text;
        return;
      }
      default:
        throw new DomainError(`unknown attribute: ${update.name}`);
    }
  }
}
