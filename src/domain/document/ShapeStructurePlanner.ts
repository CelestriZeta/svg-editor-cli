import { DomainError } from '../DomainError.js';
import { ShapeFactory } from '../ShapeFactory.js';
import { ContainerShape } from '../shapes/ContainerShape.js';
import { Group } from '../shapes/Group.js';
import type { Shape } from '../shapes/Shape.js';
import { ShapeDissolutionChange } from '../shapes/ShapeDissolutionChange.js';
import { ShapeInsertionChange } from '../shapes/ShapeInsertionChange.js';
import { ShapeLocation } from '../shapes/ShapeLocation.js';
import { ShapeRelocationChange } from '../shapes/ShapeRelocationChange.js';
import { ShapeRemovalChange } from '../shapes/ShapeRemovalChange.js';
import type { ShapeTreeChange } from '../shapes/ShapeTreeChange.js';
import { ShapeTreeChangeSet } from '../shapes/ShapeTreeChangeSet.js';
import type { ShapeSpec } from '../specs/ShapeSpec.js';
import { GroupSpec } from '../specs/GroupSpec.js';
import type { ShapeTree } from './ShapeTree.js';

export class ShapeStructurePlanner {
  public constructor(
    private readonly tree: ShapeTree,
    private readonly shapeFactory: ShapeFactory
  ) {}

  public prepareCreate(
    spec: ShapeSpec,
    parent?: ContainerShape
  ): ShapeTreeChangeSet {
    const shape = this.shapeFactory.create(spec, this.tree);
    return this.prepareInsertion(shape, parent, this.childCount(parent));
  }

  public prepareDelete(id: string): ShapeTreeChangeSet {
    const shape = this.requireShape(id);
    return new ShapeTreeChangeSet([
      new ShapeRemovalChange(this.tree, shape, this.locationOf(shape))
    ]);
  }

  public prepareGroup(
    newGroupId: string,
    targetIds: readonly string[]
  ): ShapeTreeChangeSet {
    const groupSpec = new GroupSpec(newGroupId);
    if (this.tree.findShape(newGroupId) !== undefined) {
      throw new DomainError(`id already exists: ${newGroupId}`);
    }
    if (targetIds.length < 2) {
      throw new DomainError('group requires at least two shapes');
    }

    const targets: Shape[] = [];
    const seen = new Set<string>();
    for (const id of targetIds) {
      const target = this.requireShape(id);
      if (seen.has(id)) {
        throw new DomainError(`duplicate group target: ${id}`);
      }
      seen.add(id);
      targets.push(target);
    }

    const conflictingContainer = this.findNestedGroupTarget(targets);
    if (conflictingContainer !== undefined) {
      throw new DomainError(
        `cannot group a container into its own descendant: ${conflictingContainer.id}`
      );
    }

    const group = this.shapeFactory.create(groupSpec, this.tree) as Group;
    const parent = this.commonAncestor(targets);
    const changes: ShapeTreeChange[] = [
      new ShapeInsertionChange(
        this.tree,
        group,
        new ShapeLocation(parent, this.childCount(parent))
      )
    ];
    targets.forEach((target, index) => {
      changes.push(
        new ShapeRelocationChange(
          this.tree,
          target,
          this.locationOf(target),
          new ShapeLocation(group, index)
        )
      );
    });
    return new ShapeTreeChangeSet(changes);
  }

  public prepareUngroup(groupId: string): ShapeTreeChangeSet {
    const shape = this.tree.findShape(groupId);
    if (shape === undefined) {
      throw new DomainError(`no such shape: ${groupId}`);
    }
    if (!(shape instanceof Group)) {
      throw new DomainError(`not a container: ${groupId}`);
    }

    const parent = shape.parent;
    if (parent === undefined) {
      throw new DomainError(`cannot ungroup top-level container: ${groupId}`);
    }

    return new ShapeTreeChangeSet([
      new ShapeDissolutionChange(
        this.tree,
        shape,
        parent,
        this.locationOf(shape)
      )
    ]);
  }

  public prepareAddTo(
    containerId: string,
    shapeId: string
  ): ShapeTreeChangeSet {
    const containerShape = this.tree.findShape(containerId);
    if (containerShape === undefined) {
      throw new DomainError(`no such container: ${containerId}`);
    }
    if (!(containerShape instanceof ContainerShape)) {
      throw new DomainError(`not a container: ${containerId}`);
    }
    const container = containerShape;
    const shape = this.requireShape(shapeId);
    if (this.isInSubtree(shape, container)) {
      throw new DomainError(
        `cannot move a container into its own descendant: ${shapeId}`
      );
    }

    const before = this.locationOf(shape);
    const beforeParent = before.parent;
    const beforeIndex = before.index;
    const currentCount = this.childCount(container);
    if (beforeParent === container && beforeIndex === currentCount - 1) {
      return new ShapeTreeChangeSet();
    }

    const destinationIndex =
      beforeParent === container ? currentCount - 1 : currentCount;
    return new ShapeTreeChangeSet([
      new ShapeRelocationChange(
        this.tree,
        shape,
        new ShapeLocation(beforeParent, beforeIndex),
        new ShapeLocation(container, destinationIndex)
      )
    ]);
  }

  public prepareFront(shapeId: string): ShapeTreeChangeSet {
    return this.prepareReordering(shapeId, 'front');
  }

  public prepareBack(shapeId: string): ShapeTreeChangeSet {
    return this.prepareReordering(shapeId, 'back');
  }

  private prepareReordering(
    shapeId: string,
    direction: 'front' | 'back'
  ): ShapeTreeChangeSet {
    const shape = this.requireShape(shapeId);
    const location = this.locationOf(shape);
    const parent = location.parent;
    const beforeIndex = location.index;
    const count = this.childCount(parent);
    const destinationIndex = direction === 'front' ? count - 1 : 0;
    if (beforeIndex === destinationIndex) {
      return new ShapeTreeChangeSet();
    }

    return new ShapeTreeChangeSet([
      new ShapeRelocationChange(
        this.tree,
        shape,
        new ShapeLocation(parent, beforeIndex),
        new ShapeLocation(parent, destinationIndex)
      )
    ]);
  }

  private prepareInsertion(
    shape: Shape,
    parent: ContainerShape | undefined,
    index: number
  ): ShapeTreeChangeSet {
    return new ShapeTreeChangeSet([
      new ShapeInsertionChange(this.tree, shape, new ShapeLocation(parent, index))
    ]);
  }

  private requireShape(id: string): Shape {
    const shape = this.tree.findShape(id);
    if (shape === undefined) {
      throw new DomainError(`no such shape: ${id}`);
    }
    return shape;
  }

  private locationOf(shape: Shape): ShapeLocation {
    const [parent, index] = this.tree.locationOf(shape);
    return new ShapeLocation(parent, index);
  }

  private childCount(parent: ContainerShape | undefined): number {
    return parent === undefined
      ? [...this.tree.rootChildren].length
      : [...this.tree.childrenOf(parent)].length;
  }

  private findNestedGroupTarget(
    targets: readonly Shape[]
  ): ContainerShape | undefined {
    for (const candidate of targets) {
      if (!(candidate instanceof ContainerShape)) {
        continue;
      }
      if (
        targets.some(
          (other) => other !== candidate && this.isInSubtree(candidate, other)
        )
      ) {
        return candidate;
      }
    }
    return undefined;
  }

  private commonAncestor(targets: readonly Shape[]): ContainerShape | undefined {
    let candidate = targets[0]?.parent;
    for (const target of targets.slice(1)) {
      while (candidate !== undefined && !this.isInSubtree(candidate, target)) {
        candidate = candidate.parent;
      }
    }
    return candidate;
  }

  private isInSubtree(root: Shape, possibleDescendant: Shape): boolean {
    let current: Shape | undefined = possibleDescendant;
    while (current !== undefined) {
      if (current === root) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }
}
