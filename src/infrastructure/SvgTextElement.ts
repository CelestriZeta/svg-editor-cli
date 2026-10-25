import { DomainError } from '../domain/DomainError.js';
import { TextSpec } from '../domain/specs/TextSpec.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import type { SvgAttributes } from './SvgAttributes.js';
import type { SvgElement } from './SvgElement.js';
import { SvgStyledElement } from './SvgStyledElement.js';

export class SvgTextElement extends SvgStyledElement {
  readonly #x: number;
  readonly #y: number;
  #content = '';

  public constructor(attributes: SvgAttributes) {
    attributes.requireSupported([
      'id',
      'x',
      'y',
      'fill',
      'stroke',
      'stroke-width'
    ]);
    super('text', attributes.optionalId(), attributes.style());
    this.#x = attributes.requireNumber('x');
    this.#y = attributes.requireNumber('y');
  }

  public override appendText(content: string): void {
    this.#content += content;
  }

  public override addChild(_child: SvgElement): void {
    throw new DomainError('text cannot contain child elements');
  }

  protected override createSpec(id: string): ShapeSpec {
    return new TextSpec(id, this.#x, this.#y, this.#content, this.style);
  }
}
