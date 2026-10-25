import type { ShapeTreeChange } from '../shapes/ShapeTreeChange.js';
import { DomainError } from '../DomainError.js';
import { ShapeFactory } from '../ShapeFactory.js';
import { ContainerShape } from '../shapes/ContainerShape.js';
import type { Shape } from '../shapes/Shape.js';
import type { CompositeChangeSet } from '../CompositeChangeSet.js';
import type { ShapeSpec } from '../specs/ShapeSpec.js';
import { CanvasSize } from './CanvasSize.js';
import { ShapeStructurePlanner as Planner } from './ShapeStructurePlanner.js';
import { ShapeTree } from './ShapeTree.js';

export class SvgDocument {
  #canvasSize: CanvasSize;
  readonly #tree = new ShapeTree();
  readonly #planner: Planner;

  public constructor(
    width: number,
    height: number,
    shapeFactory = new ShapeFactory()
  ) {
    this.#canvasSize = new CanvasSize(width, height);
    this.#planner = new Planner(this.#tree, shapeFactory);
  }

  public get width(): number {
    return this.#canvasSize.width;
  }

  public get height(): number {
    return this.#canvasSize.height;
  }

  public get canvasSize(): CanvasSize {
    return this.#canvasSize;
  }

  public resizeCanvas(width: number, height: number): CanvasSize {
    const canvasSize = new CanvasSize(width, height);
    this.#canvasSize = canvasSize;
    return canvasSize;
  }

  public get elementCount(): number {
    return this.#tree.elementCount;
  }

  public get children(): Iterable<Shape> {
    return this.#tree.rootChildren;
  }

  public createShape(spec: ShapeSpec, parent?: ContainerShape): Shape {
    this.prepareCreateShape(spec, parent).apply();
    return this.requireShape(spec.id);
  }

  public prepareCreateShape(
    spec: ShapeSpec,
    parent?: ContainerShape
  ): CompositeChangeSet<ShapeTreeChange> {
    return this.#planner.prepareCreate(spec, parent);
  }

  public findShape(id: string): Shape | undefined {
    return this.#tree.findShape(id);
  }

  public requireShape(id: string): Shape {
    const shape = this.findShape(id);
    if (shape === undefined) {
      throw new DomainError(`no such shape: ${id}`);
    }
    return shape;
  }

  public requireContainer(id: string): ContainerShape {
    const shape = this.findShape(id);
    if (shape === undefined) {
      throw new DomainError(`no such container: ${id}`);
    }
    if (!(shape instanceof ContainerShape)) {
      throw new DomainError(`not a container: ${id}`);
    }
    return shape;
  }

  public parentOf(id: string): ContainerShape | undefined {
    return this.requireShape(id).parent;
  }

  public deleteShape(id: string): Shape {
    const shape = this.requireShape(id);
    this.prepareDeleteShape(id).apply();
    return shape;
  }

  public prepareDeleteShape(id: string): CompositeChangeSet<ShapeTreeChange> {
    return this.#planner.prepareDelete(id);
  }

  public prepareGroup(
    newGroupId: string,
    targetIds: readonly string[]
  ): CompositeChangeSet<ShapeTreeChange> {
    return this.#planner.prepareGroup(newGroupId, targetIds);
  }

  public prepareUngroup(groupId: string): CompositeChangeSet<ShapeTreeChange> {
    return this.#planner.prepareUngroup(groupId);
  }

  public prepareAddTo(
    containerId: string,
    shapeId: string
  ): CompositeChangeSet<ShapeTreeChange> {
    return this.#planner.prepareAddTo(containerId, shapeId);
  }

  public prepareFront(shapeId: string): CompositeChangeSet<ShapeTreeChange> {
    return this.#planner.prepareFront(shapeId);
  }

  public prepareBack(shapeId: string): CompositeChangeSet<ShapeTreeChange> {
    return this.#planner.prepareBack(shapeId);
  }
}
