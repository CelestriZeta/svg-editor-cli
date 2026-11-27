import type { ShapeProvider } from '../application/extensions/ShapeProvider.js';
import { SvgContentKind } from '../application/ports/SvgContentKind.js';
import { ContainerShape } from '../domain/shapes/ContainerShape.js';
import type { SvgDocument } from '../domain/document/SvgDocument.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import { ShapeSpecWithChildren } from '../domain/specs/ShapeSpecWithChildren.js';
import { DomainError } from '../domain/DomainError.js';

/** 以实际 SVG 后代替换 CLI 创建模板，完整构造后再运行导入校验。 */
export class DecodedSvgElement {
  readonly #children: readonly DecodedSvgElement[];
  readonly #spec: ShapeSpec;

  public constructor(
    spec: ShapeSpec,
    private readonly provider: ShapeProvider,
    children: readonly DecodedSvgElement[]
  ) {
    this.#children = Object.freeze([...children]);
    this.#spec = new ShapeSpecWithChildren(spec, this.#children.map((child) => child.#spec));
  }

  public appendTo(document: SvgDocument, parent: ContainerShape | undefined): void {
    document.createShape(this.#spec, parent);
    this.validate(document);
  }

  private validate(document: SvgDocument): void {
    const shape = document.requireShape(this.#spec.id);
    if ((this.provider.content === SvgContentKind.Children) !== (shape instanceof ContainerShape)) {
      throw new DomainError('invalid imported shape structure: ' + this.provider.name);
    }
    for (const child of this.#children) child.validate(document);
    this.provider.validateImported(shape);
  }
}
