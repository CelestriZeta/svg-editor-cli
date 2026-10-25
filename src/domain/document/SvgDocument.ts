import { DomainError } from '../DomainError.js';
import { ShapeFactory } from '../ShapeFactory.js';
import type { ContainerShape } from '../shapes/ContainerShape.js';
import type { Shape } from '../shapes/Shape.js';
import {
  CONTAINER_APPEND,
  CONTAINER_REMOVE
} from '../shapes/ShapeTreeMutation.js';
import type { ShapeSpec } from '../specs/ShapeSpec.js';
import { ShapeCollector } from '../visitor/ShapeCollector.js';

export class SvgDocument {
  readonly #width: number;
  readonly #height: number;
  readonly #shapeFactory: ShapeFactory;
  readonly #children: Shape[] = [];
  readonly #shapesById = new Map<string, Shape>();

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
    return this.#shapesById.size;
  }

  public get children(): Iterable<Shape> {
    return this.#children.values();
  }

  public createShape(spec: ShapeSpec, parent?: ContainerShape): Shape {
    if (this.#shapesById.has(spec.id)) {
      throw new DomainError(`id already exists: ${spec.id}`);
    }

    if (parent !== undefined && this.#shapesById.get(parent.id) !== parent) {
      throw new DomainError(`no such container: ${parent.id}`);
    }

    const shape = this.#shapeFactory.create(spec);
    const subtree = this.collectSubtree(shape);
    const subtreeIds = new Set<string>();

    for (const node of subtree) {
      if (this.#shapesById.has(node.id) || subtreeIds.has(node.id)) {
        throw new DomainError(`id already exists: ${node.id}`);
      }
      subtreeIds.add(node.id);
    }

    if (parent === undefined) {
      this.#children.push(shape);
    } else {
      parent[CONTAINER_APPEND](shape);
    }

    for (const node of subtree) {
      this.#shapesById.set(node.id, node);
    }

    return shape;
  }

  public findShape(id: string): Shape | undefined {
    return this.#shapesById.get(id);
  }

  public requireShape(id: string): Shape {
    const shape = this.findShape(id);
    if (shape === undefined) {
      throw new DomainError(`no such shape: ${id}`);
    }
    return shape;
  }

  public parentOf(id: string): ContainerShape | undefined {
    return this.requireShape(id).parent;
  }

  public deleteShape(id: string): Shape {
    const shape = this.requireShape(id);
    const subtree = this.collectSubtree(shape);

    if (shape.parent === undefined) {
      const index = this.#children.indexOf(shape);
      if (index === -1) {
        throw new DomainError(`no such shape: ${id}`);
      }
      this.#children.splice(index, 1);
    } else {
      shape.parent[CONTAINER_REMOVE](shape);
    }

    for (const node of subtree) {
      this.#shapesById.delete(node.id);
    }

    return shape;
  }

  public removeShape(id: string): void {
    this.deleteShape(id);
  }

  private collectSubtree(shape: Shape): Shape[] {
    return [...new ShapeCollector().collect(shape)];
  }
}
