import { CircleSpec } from '../domain/specs/CircleSpec.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import type { SvgAttributes } from './SvgAttributes.js';
import { SvgStyledElement } from './SvgStyledElement.js';

export class SvgCircleElement extends SvgStyledElement {
  readonly #cx: number;
  readonly #cy: number;
  readonly #r: number;

  public constructor(attributes: SvgAttributes) {
    attributes.requireSupported([
      'id',
      'cx',
      'cy',
      'r',
      'fill',
      'stroke',
      'stroke-width'
    ]);
    super('circle', attributes.optionalId(), attributes.style());
    this.#cx = attributes.requireNumber('cx');
    this.#cy = attributes.requireNumber('cy');
    this.#r = attributes.requireNumber('r');
  }

  protected override createSpec(id: string): ShapeSpec {
    return new CircleSpec(id, this.#cx, this.#cy, this.#r, this.style);
  }
}
