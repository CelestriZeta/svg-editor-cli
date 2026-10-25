import { DomainError } from '../DomainError.js';
import type { ContainerShape } from '../shapes/ContainerShape.js';
import type { Shape } from '../shapes/Shape.js';
import { ShapeCollector } from '../visitor/ShapeCollector.js';

export class ShapeTree {
  readonly #rootChildren: Shape[] = [];
  readonly #childrenByContainer = new Map<ContainerShape, Shape[]>();
  readonly #parents = new Map<Shape, ContainerShape | undefined>();
  readonly #shapesById = new Map<string, Shape>();

  public get elementCount(): number {
    return this.#shapesById.size;
  }

  public get rootChildren(): Iterable<Shape> {
    return this.#rootChildren.values();
  }

  public childrenOf(parent: ContainerShape): Iterable<Shape> {
    return (this.#childrenByContainer.get(parent) ?? []).values();
  }

  public findShape(id: string): Shape | undefined {
    return this.#shapesById.get(id);
  }

  public parentOf(shape: Shape): ContainerShape | undefined {
    return this.#parents.get(shape);
  }

  public locationOf(shape: Shape): readonly [ContainerShape | undefined, number] {
    this.requireIndexed(shape);
    const parent = this.parentOf(shape);
    const siblings = this.childrenFor(parent);
    const index = siblings.indexOf(shape);
    if (index === -1) {
      throw new DomainError(`no such shape: ${shape.id}`);
    }
    return [parent, index];
  }

  public adopt(shape: Shape, parent: ContainerShape | undefined, index: number): void {
    this.assertContainerBelongsToTree(parent);
    if (this.#parents.has(shape)) {
      throw new DomainError(`shape already has a parent: ${shape.id}`);
    }

    const subtree = [...new ShapeCollector().collect(shape)];
    this.validateAvailableIds(subtree);
    this.requireValidIndex(index, this.childrenFor(parent).length);

    this.insert(shape, parent, index);
    for (const node of subtree) {
      this.#shapesById.set(node.id, node);
    }
  }

  public disown(shape: Shape): void {
    this.requireIndexed(shape);
    const subtree = [...new ShapeCollector().collect(shape)];
    // 只摘除子树根并注销 id，保留子树内部关系，供撤销时整体重新接入。
    this.detach(shape);
    for (const node of subtree) {
      this.#shapesById.delete(node.id);
    }
  }

  public relocate(
    shape: Shape,
    parent: ContainerShape | undefined,
    index: number
  ): void {
    this.requireIndexed(shape);
    this.assertContainerBelongsToTree(parent);
    if (parent !== undefined && this.isInSubtree(shape, parent)) {
      throw new DomainError(
        `cannot move a container into its own descendant: ${shape.id}`
      );
    }

    const [beforeParent, beforeIndex] = this.locationOf(shape);
    // 目标下标以摘除后的列表为准；同父级移动时需扣除节点自身。
    const targetCount =
      this.childrenFor(parent).length - (beforeParent === parent ? 1 : 0);
    this.requireValidIndex(index, targetCount);

    this.detach(shape);
    try {
      this.insert(shape, parent, index);
    } catch (error) {
      this.insert(shape, beforeParent, beforeIndex);
      throw error;
    }
  }

  private childrenFor(parent: ContainerShape | undefined): Shape[] {
    if (parent === undefined) {
      return this.#rootChildren;
    }

    let children = this.#childrenByContainer.get(parent);
    if (children === undefined) {
      children = [];
      this.#childrenByContainer.set(parent, children);
    }
    return children;
  }

  private insert(
    shape: Shape,
    parent: ContainerShape | undefined,
    index: number
  ): void {
    this.childrenFor(parent).splice(index, 0, shape);
    this.#parents.set(shape, parent);
  }

  private detach(shape: Shape): void {
    const parent = this.parentOf(shape);
    const siblings = this.childrenFor(parent);
    const index = siblings.indexOf(shape);
    if (index === -1) {
      throw new DomainError(`no such shape: ${shape.id}`);
    }
    siblings.splice(index, 1);
    this.#parents.delete(shape);
  }

  private requireIndexed(shape: Shape): void {
    if (this.#shapesById.get(shape.id) !== shape) {
      throw new DomainError(`no such shape: ${shape.id}`);
    }
  }

  private validateAvailableIds(subtree: readonly Shape[]): void {
    const ids = new Set<string>();
    for (const node of subtree) {
      if (ids.has(node.id) || this.#shapesById.has(node.id)) {
        throw new DomainError(`id already exists: ${node.id}`);
      }
      ids.add(node.id);
    }
  }

  private assertContainerBelongsToTree(parent: ContainerShape | undefined): void {
    if (parent !== undefined && this.#shapesById.get(parent.id) !== parent) {
      throw new DomainError(`no such container: ${parent.id}`);
    }
  }

  private isInSubtree(root: Shape, possibleDescendant: Shape): boolean {
    let current: Shape | undefined = possibleDescendant;
    while (current !== undefined) {
      if (current === root) {
        return true;
      }
      current = this.parentOf(current);
    }
    return false;
  }

  private requireValidIndex(index: number, maximum: number): void {
    if (!Number.isSafeInteger(index) || index < 0 || index > maximum) {
      throw new DomainError(`invalid child index: ${index}`);
    }
  }
}
