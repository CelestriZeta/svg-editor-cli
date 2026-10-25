import { DomainError } from '../DomainError.js';
import { ShapeFactory } from '../ShapeFactory.js';
import type { Shape } from '../shapes/Shape.js';
import type { ShapeSpec } from '../specs/ShapeSpec.js';

export class SvgDocument {
  readonly #width: number;
  readonly #height: number;
  readonly #shapeFactory: ShapeFactory;
  readonly #children: Shape[] = [];
  readonly #ids = new Set<string>();

  public constructor(
    width: number,
    height: number,
    shapeFactory = new ShapeFactory()
  ) {
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      throw new DomainError('canvas width and height must be positive finite numbers');
    }

    this.#width = width;
    this.#height = height;
    this.#shapeFactory = shapeFactory;
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

  public get elementCount(): number {
    return this.#children.length;
  }

  public get children(): Iterable<Shape> {
    return this.#children.values();
  }

  public createShape(spec: ShapeSpec): Shape {
    if (this.#ids.has(spec.id)) {
      throw new DomainError(`id already exists: ${spec.id}`);
    }

    const shape = this.#shapeFactory.create(spec);
    this.#ids.add(shape.id);
    this.#children.push(shape);
    return shape;
  }

  public removeShape(id: string): void {
    const index = this.#children.findIndex((shape) => shape.id === id);
    if (index === -1) {
      throw new DomainError(`no such shape: ${id}`);
    }

    this.#children.splice(index, 1);
    this.#ids.delete(id);
  }
}
