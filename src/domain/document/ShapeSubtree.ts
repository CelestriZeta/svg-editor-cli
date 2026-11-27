import { DomainError } from '../DomainError.js';
import { ShapeSpec } from '../specs/ShapeSpec.js';
import type { Shape } from '../shapes/Shape.js';
import { ContainerShape } from '../shapes/ContainerShape.js';
import type { ShapeRelations } from '../shapes/ShapeRelations.js';
import { ShapeStructureCandidate } from './ShapeStructureCandidate.js';
import { ShapeRelationsBinding } from './ShapeRelationsBinding.js';

/** 未发布的完整子树；图形始终持有只读门面，安装后切换到活动树关系。 */
export class ShapeSubtree {
  readonly #candidate = new ShapeStructureCandidate();
  readonly #root: Shape;
  readonly #binding: ShapeRelationsBinding;

  public constructor(
    spec: ShapeSpec,
    private readonly live: ShapeRelations,
    create: (spec: ShapeSpec, relations: ShapeRelations) => Shape
  ) {
    this.#binding = new ShapeRelationsBinding(this.#candidate);
    this.#root = this.build(spec, undefined, create, this.#binding.view);
    // 容器策略在包含目标父级的完整预演中校验，不能把未挂接根误判为最终状态。
  }

  public get root(): Shape { return this.#root; }
  public get nodes(): readonly Shape[] { return this.#candidate.nodes; }
  public parentOf(shape: Shape): ContainerShape | undefined { return this.#candidate.parentOf(shape); }
  public childrenOf(parent: ContainerShape): Iterable<Shape> { return this.#candidate.childrenOf(parent); }
  public connect(): void { this.#binding.connect(this.live); }

  private build(
    spec: ShapeSpec,
    parent: ContainerShape | undefined,
    create: (spec: ShapeSpec, relations: ShapeRelations) => Shape,
    view: ShapeRelations
  ): Shape {
    if (!(spec instanceof ShapeSpec)) throw new DomainError('invalid child specification');
    const shape = create(spec, view);
    const children = [...spec.children];
    if (children.length > 0 && !(shape instanceof ContainerShape)) {
      throw new DomainError(`shape cannot contain child specifications: ${shape.id}`);
    }
    this.#candidate.insert(shape, parent, this.#candidate.childCount(parent));
    if (shape instanceof ContainerShape) {
      for (const child of children) this.build(child, shape, create, view);
    }
    return shape;
  }
}
