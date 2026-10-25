import { RectSpec } from '../domain/specs/RectSpec.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import type { ShapeStyle } from '../domain/shapes/ShapeStyle.js';
import type { SvgAttributes } from './SvgAttributes.js';
import { SvgStyledElement } from './SvgStyledElement.js';

export class SvgRectElement extends SvgStyledElement {
  readonly #x: number;
  readonly #y: number;
  readonly #width: number;
  readonly #height: number;

  public constructor(attributes: SvgAttributes) {
    attributes.requireSupported([
      'id',
      'x',
      'y',
      'width',
      'height',
      'fill',
      'stroke',
      'stroke-width'
    ]);
    super('rect', attributes.optionalId(), attributes.style());
    this.#x = attributes.requireNumber('x');
    this.#y = attributes.requireNumber('y');
    this.#width = attributes.requireNumber('width');
    this.#height = attributes.requireNumber('height');
  }

  protected override createSpec(id: string): ShapeSpec {
    return new RectSpec(
      id,
      this.#x,
      this.#y,
      this.#width,
      this.#height,
      this.style
    );
  }
}
