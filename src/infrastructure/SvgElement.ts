import { ContainerShape } from '../domain/shapes/ContainerShape.js';
import type { SvgDocument } from '../domain/document/SvgDocument.js';
import { DomainError } from '../domain/DomainError.js';
import { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import type { ShapeProvider } from '../application/extensions/ShapeProvider.js';
import { SvgContentKind } from '../application/ports/SvgContentKind.js';
import type { MissingIdAllocator } from './MissingIdAllocator.js';
import type { SvgAttributes } from './SvgAttributes.js';
import { SvgShapeInputValue } from './SvgShapeInputValue.js';

export class SvgElement {
  readonly #children: SvgElement[] = [];
  readonly #id: string | undefined;
  #text = '';
  public constructor(
    private readonly tag: string,
    private readonly attributes: SvgAttributes,
    private readonly provider: ShapeProvider
  ) { this.#id = attributes.optionalId(); }
  public get tagName(): string { return this.tag; }
  public get id(): string | undefined { return this.#id; }
  public collectExplicitIds(ids: Set<string>): void {
    if (this.#id !== undefined) {
      if (ids.has(this.#id)) throw new DomainError('id already exists: ' + this.#id);
      ids.add(this.#id);
    }
    for (const child of this.#children) child.collectExplicitIds(ids);
  }
  public addChild(child: SvgElement): void {
    if (this.provider.content !== SvgContentKind.Children) throw new DomainError(this.tag + ' cannot contain child elements');
    this.#children.push(child);
  }
  public appendText(text: string): void {
    if (this.provider.content === SvgContentKind.Text) this.#text += text;
    else if (text.trim().length > 0) throw new DomainError('text content is not supported outside text elements');
  }
  public appendTo(document: SvgDocument, parent: ContainerShape | undefined, ids: MissingIdAllocator): void {
    const id = ids.resolve(this.#id, this.tag);
    const spec = this.provider.decode(new SvgShapeInputValue(id, this.#text, this.attributes));
    if (!(spec instanceof ShapeSpec) || spec.id !== id || spec.type !== this.provider.name) {
      throw new DomainError('invalid imported shape specification: ' + this.provider.name);
    }
    const shape = document.createShape(spec, parent);
    if ((this.provider.content === SvgContentKind.Children) !== (shape instanceof ContainerShape)) {
      throw new DomainError('invalid imported shape structure: ' + this.provider.name);
    }
    if (shape instanceof ContainerShape) {
      for (const child of this.#children) child.appendTo(document, shape, ids);
    }
    this.provider.validateImported(shape);
  }
}
