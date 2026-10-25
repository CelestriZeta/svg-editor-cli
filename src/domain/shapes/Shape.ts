import { DomainError } from '../DomainError.js';
import type { ShapeTree } from '../document/ShapeTree.js';
import type { ShapeVisitor } from '../visitor/ShapeVisitor.js';
import type { ContainerShape } from './ContainerShape.js';
import type { GeometryChangeSet } from './GeometryChangeSet.js';
import { ShapeAttributeChange } from './ShapeAttributeChange.js';
import { CompositeChangeSet } from '../CompositeChangeSet.js';
import { ShapeAttributeSlot } from './ShapeAttributeSlot.js';
import type { ShapeAttributeUpdate } from './ShapeAttributeUpdate.js';
import { ShapeAttributeValue } from './ShapeAttributeValue.js';
import { ShapeAttributeValueKind } from './ShapeAttributeValueKind.js';
import { ShapeStyle } from './ShapeStyle.js';

export abstract class Shape {
  readonly #id: string;
  readonly #tree: ShapeTree;
  readonly #styleAttributeSlots: ReadonlyMap<string, ShapeAttributeSlot>;
  #style: ShapeStyle;

  protected constructor(
    id: string,
    tree: ShapeTree,
    style = new ShapeStyle()
  ) {
    if (id.trim().length === 0) {
      throw new DomainError('shape id must not be empty');
    }

    this.#id = id;
    this.#tree = tree;
    this.#style = style;
    this.#styleAttributeSlots = this.createStyleAttributeSlots();
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
    return this.#tree.parentOf(this);
  }

  public abstract readonly type: string;

  public prepareSet(update: ShapeAttributeUpdate): CompositeChangeSet<ShapeAttributeChange> {
    const slot = this.requireAttributeSlot(update.name);
    return new CompositeChangeSet([
      new ShapeAttributeChange(
        slot,
        slot.capture(),
        slot.prepare(update)
      )
    ]);
  }

  public set(update: ShapeAttributeUpdate): void {
    const slot = this.requireAttributeSlot(update.name);
    slot.write(slot.prepare(update));
  }

  public attributeKind(name: string): ShapeAttributeValueKind {
    return this.requireAttributeSlot(name).kind;
  }

  public attributeValue(name: string): ShapeAttributeValue {
    return this.requireAttributeSlot(name).capture();
  }

  public move(dx: number, dy: number): void {
    this.prepareMove(dx, dy).apply();
  }

  public scale(factor: number): void {
    this.prepareScale(factor).apply();
  }

  public abstract accept<T>(visitor: ShapeVisitor<T>): T;

  public abstract prepareMove(dx: number, dy: number): GeometryChangeSet;

  public abstract prepareScale(factor: number): GeometryChangeSet;

  protected abstract ownAttributeSlot(
    name: string
  ): ShapeAttributeSlot | undefined;

  protected childrenOf(container: ContainerShape): Iterable<Shape> {
    return this.#tree.childrenOf(container);
  }

  private createStyleAttributeSlots(): ReadonlyMap<string, ShapeAttributeSlot> {
    return new Map<string, ShapeAttributeSlot>([
      [
        'fill',
        ShapeAttributeSlot.text(
          'fill',
          () =>
            this.#style.fill === undefined
              ? ShapeAttributeValue.absent()
              : ShapeAttributeValue.text(this.#style.fill),
          (value) => {
            this.#style = this.#style.withFill(
              value.isAbsent ? undefined : value.textValue
            );
          },
          (value) => {
            if (value.length === 0) {
              throw new DomainError('fill must not be empty');
            }
          }
        )
      ],
      [
        'stroke',
        ShapeAttributeSlot.text(
          'stroke',
          () =>
            this.#style.stroke === undefined
              ? ShapeAttributeValue.absent()
              : ShapeAttributeValue.text(this.#style.stroke),
          (value) => {
            this.#style = this.#style.withStroke(
              value.isAbsent ? undefined : value.textValue
            );
          },
          (value) => {
            if (value.length === 0) {
              throw new DomainError('stroke must not be empty');
            }
          }
        )
      ],
      [
        'stroke-width',
        ShapeAttributeSlot.number(
          'stroke-width',
          () =>
            this.#style.strokeWidth === undefined
              ? ShapeAttributeValue.absent()
              : ShapeAttributeValue.number(this.#style.strokeWidth),
          (value) => {
            this.#style = this.#style.withStrokeWidth(
              value.isAbsent ? undefined : value.numericValue
            );
          },
          (value) => {
            if (value < 0) {
              throw new DomainError(
                'stroke-width must be a non-negative finite number'
              );
            }
          }
        )
      ]
    ]);
  }

  private requireAttributeSlot(name: string): ShapeAttributeSlot {
    const slot = this.#styleAttributeSlots.get(name) ?? this.ownAttributeSlot(name);
    if (slot === undefined) {
      throw new DomainError(`unknown attribute: ${name}`);
    }
    return slot;
  }

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
