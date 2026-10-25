import { DomainError } from '../DomainError.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import type { ContainerShape } from './ContainerShape.js';
import type { GeometryChangeSet } from './GeometryChangeSet.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';
import { SHAPE_SET_PARENT } from './ShapeTreeMutation.js';
import { ShapeStyle } from './ShapeStyle.js';

export abstract class Shape {
  readonly #id: string;
  #style: ShapeStyle;
  #parent: ContainerShape | undefined;

  protected constructor(id: string, style = new ShapeStyle()) {
    if (id.trim().length === 0) {
      throw new DomainError('shape id must not be empty');
    }

    this.#id = id;
    this.#style = style;
    this.#parent = undefined;
  }

  public get id(): string {
    return this.#id;
  }

  public get fill(): string | undefined {
    return this.#style.fill;
  }

  public get stroke(): string | undefined {
    return this.#style.stroke;
  }

  public get strokeWidth(): number | undefined {
    return this.#style.strokeWidth;
  }

  public get parent(): ContainerShape | undefined {
    return this.#parent;
  }

  public abstract readonly type: string;

  public set(update: ShapeAttributeUpdate): void {
    const updatedStyle = this.#style.withAttribute(update);
    if (updatedStyle !== undefined) {
      this.#style = updatedStyle;
      return;
    }

    this.setOwnAttribute(update);
  }

  public move(dx: number, dy: number): void {
    this.prepareMove(dx, dy).apply();
  }

  public scale(factor: number): void {
    this.prepareScale(factor).apply();
  }

  public abstract accept<T>(visitor: ShapeVisitor<T>): T;

  public [SHAPE_SET_PARENT](parent: ContainerShape | undefined): void {
    if (
      this.#parent !== undefined &&
      parent !== undefined &&
      this.#parent !== parent
    ) {
      throw new DomainError(`shape already has a parent: ${this.#id}`);
    }

    this.#parent = parent;
  }

  public abstract prepareMove(dx: number, dy: number): GeometryChangeSet;

  public abstract prepareScale(factor: number): GeometryChangeSet;

  protected abstract setOwnAttribute(update: ShapeAttributeUpdate): void;

  protected static requireMoveDelta(dx: number, dy: number): void {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
      throw new DomainError('move delta must be finite numbers');
    }
  }

  protected static requireScaleFactor(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new DomainError('scale factor must be positive');
    }
  }

  protected static requireFiniteGeometry(
    values: readonly number[],
    message: string
  ): void {
    if (!values.every((value) => Number.isFinite(value))) {
      throw new DomainError(message);
    }
  }
}
