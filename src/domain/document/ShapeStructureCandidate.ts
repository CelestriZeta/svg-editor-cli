import { DomainError } from '../DomainError.js';
import type { Shape } from '../shapes/Shape.js';
import { ContainerShape } from '../shapes/ContainerShape.js';
import type { ShapeRelations } from '../shapes/ShapeRelations.js';
import { ShapeCollector } from '../visitor/ShapeCollector.js';
import type { ShapeTree } from './ShapeTree.js';

/** 只复制结构关系，不复制领域对象；预演失败可直接丢弃，不触碰活动树。 */
export class ShapeStructureCandidate implements ShapeRelations {
  readonly #roots: Shape[] = [];
  readonly #nodes = new Map<string, Shape>();
  readonly #parents = new Map<Shape, ContainerShape | undefined>();
  readonly #children = new Map<ContainerShape, Shape[]>();

  public constructor(tree?: ShapeTree) {
    if (tree !== undefined) {
      for (const root of tree.rootChildren) this.insert(root, undefined, this.#roots.length);
    }
  }

  public get nodes(): readonly Shape[] { return Object.freeze([...this.#nodes.values()]); }

  public parentOf(shape: Shape): ContainerShape | undefined { return this.#parents.get(shape); }

  public childrenOf(parent: ContainerShape): Iterable<Shape> {
    return (this.#children.get(parent) ?? []).values();
  }

  public childCount(parent?: ContainerShape): number {
    return parent === undefined ? this.#roots.length : (this.#children.get(parent)?.length ?? 0);
  }

  public indexOf(shape: Shape): number {
    this.requireNode(shape);
    return this.siblings(this.parentOf(shape)).indexOf(shape);
  }

  public insert(shape: Shape, parent: ContainerShape | undefined, index: number): void {
    this.requireParent(parent);
    this.requireIndex(index, this.childCount(parent));
    const nodes = new ShapeCollector().collect(shape);
    const ids = new Set<string>();
    for (const node of nodes) {
      if (ids.has(node.id) || this.#nodes.has(node.id)) throw new DomainError(`id already exists: ${node.id}`);
      ids.add(node.id);
    }
    const children = new Map<ContainerShape, Shape[]>();
    for (const node of nodes) {
      if (node instanceof ContainerShape) children.set(node, [...node.children]);
    }
    this.siblings(parent).splice(index, 0, shape);
    for (const node of nodes) this.#nodes.set(node.id, node);
    this.#parents.set(shape, parent);
    for (const [container, members] of children) {
      this.#children.set(container, members);
      for (const child of members) this.#parents.set(child, container);
    }
  }

  public remove(shape: Shape): void {
    this.requireNode(shape);
    const descendants: Shape[] = [];
    const pending = [shape];
    while (pending.length > 0) {
      const node = pending.pop();
      if (node === undefined) break;
      descendants.push(node);
      if (node instanceof ContainerShape) pending.push(...this.childrenOf(node));
    }
    this.detach(shape);
    for (const node of descendants) {
      this.#nodes.delete(node.id);
      this.#parents.delete(node);
      if (node instanceof ContainerShape) this.#children.delete(node);
    }
  }

  public relocate(shape: Shape, parent: ContainerShape | undefined, index: number): void {
    this.requireNode(shape);
    this.requireParent(parent);
    let ancestor: Shape | undefined = parent;
    while (ancestor !== undefined) {
      if (ancestor === shape) throw new DomainError(`cannot move a container into its own descendant: ${shape.id}`);
      ancestor = this.parentOf(ancestor);
    }
    const sameParent = this.parentOf(shape) === parent;
    this.requireIndex(index, this.childCount(parent) - (sameParent ? 1 : 0));
    this.detach(shape);
    this.siblings(parent).splice(index, 0, shape);
    this.#parents.set(shape, parent);
  }

  public validate(): void {
    const view: ShapeRelations = Object.freeze({
      parentOf: (shape) => this.parentOf(shape),
      childrenOf: (parent) => this.childrenOf(parent)
    } satisfies ShapeRelations);
    for (const shape of this.#nodes.values()) {
      if (shape instanceof ContainerShape) shape.validateStructure(view);
    }
  }

  private siblings(parent: ContainerShape | undefined): Shape[] {
    if (parent === undefined) return this.#roots;
    let list = this.#children.get(parent);
    if (list === undefined) { list = []; this.#children.set(parent, list); }
    return list;
  }

  private detach(shape: Shape): void {
    const siblings = this.siblings(this.parentOf(shape));
    const index = siblings.indexOf(shape);
    if (index < 0) throw new DomainError(`no such shape: ${shape.id}`);
    siblings.splice(index, 1);
  }

  private requireParent(parent: ContainerShape | undefined): void {
    if (parent !== undefined && this.#nodes.get(parent.id) !== parent) {
      throw new DomainError(`no such container: ${parent.id}`);
    }
  }

  private requireNode(shape: Shape): void {
    if (this.#nodes.get(shape.id) !== shape) throw new DomainError(`no such shape: ${shape.id}`);
  }

  private requireIndex(index: number, maximum: number): void {
    if (!Number.isSafeInteger(index) || index < 0 || index > maximum) throw new DomainError(`invalid child index: ${index}`);
  }
}
