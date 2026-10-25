import { GroupSpec } from '../domain/specs/GroupSpec.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import type { ContainerShape } from '../domain/shapes/ContainerShape.js';
import type { SvgDocument } from '../domain/document/SvgDocument.js';
import { Group } from '../domain/shapes/Group.js';
import type { MissingIdAllocator } from './MissingIdAllocator.js';
import type { SvgAttributes } from './SvgAttributes.js';
import type { SvgElement } from './SvgElement.js';
import { SvgStyledElement } from './SvgStyledElement.js';

export class SvgGroupElement extends SvgStyledElement {
  readonly #children: SvgElement[] = [];

  public constructor(attributes: SvgAttributes) {
    attributes.requireSupported([
      'id',
      'fill',
      'stroke',
      'stroke-width'
    ]);
    super('g', attributes.optionalId(), attributes.style());
  }

  public override addChild(child: SvgElement): void {
    this.#children.push(child);
  }

  public override collectExplicitIds(ids: Set<string>): void {
    super.collectExplicitIds(ids);
    for (const child of this.#children) {
      child.collectExplicitIds(ids);
    }
  }

  public override appendTo(
    document: SvgDocument,
    parent: ContainerShape | undefined,
    ids: MissingIdAllocator
  ): void {
    const id = ids.resolve(this.id, this.tagName);
    const container = document.createShape(
      this.createSpec(id),
      parent
    );
    if (!(container instanceof Group)) {
      throw new Error('group creation did not produce a group');
    }
    for (const child of this.#children) {
      child.appendTo(document, container, ids);
    }
  }

  protected override createSpec(id: string): ShapeSpec {
    return new GroupSpec(id, this.style);
  }
}
