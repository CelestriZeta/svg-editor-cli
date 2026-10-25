import { LineSpec } from '../domain/specs/LineSpec.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import type { SvgAttributes } from './SvgAttributes.js';
import { SvgStyledElement } from './SvgStyledElement.js';

export class SvgLineElement extends SvgStyledElement {
  readonly #x1: number;
  readonly #y1: number;
  readonly #x2: number;
  readonly #y2: number;

  public constructor(attributes: SvgAttributes) {
    attributes.requireSupported([
      'id',
      'x1',
      'y1',
      'x2',
      'y2',
      'fill',
      'stroke',
      'stroke-width'
    ]);
    super('line', attributes.optionalId(), attributes.style());
    this.#x1 = attributes.requireNumber('x1');
    this.#y1 = attributes.requireNumber('y1');
    this.#x2 = attributes.requireNumber('x2');
    this.#y2 = attributes.requireNumber('y2');
  }

  protected override createSpec(id: string): ShapeSpec {
    return new LineSpec(
      id,
      this.#x1,
      this.#y1,
      this.#x2,
      this.#y2,
      this.style
    );
  }
}
