import { DomainError } from '../DomainError.js';
import type { RectSpec } from '../specs/RectSpec.js';
import { GeometryChangeSet } from './GeometryChangeSet.js';
import { GeometryValueChange } from './GeometryValueChange.js';
import { Shape } from './Shape.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';

export class Rect extends Shape {
  #x: number;
  #y: number;
  #width: number;
  #height: number;

  public constructor(spec: RectSpec) {
    super(spec.id, spec.style);

    if (spec.type !== 'rect') {
      throw new DomainError('invalid rect specification');
    }

    this.#x = spec.x;
    this.#y = spec.y;
    this.#width = spec.width;
    this.#height = spec.height;
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

  protected override setOwnAttribute(update: ShapeAttributeUpdate): void {
    switch (update.name) {
      case 'x':
        this.#x = update.numericValue;
        return;
      case 'y':
        this.#y = update.numericValue;
        return;
      case 'width':
        this.#width = this.requirePositive(update);
        return;
      case 'height':
        this.#height = this.requirePositive(update);
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
