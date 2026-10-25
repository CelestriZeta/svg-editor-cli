import { EllipseSpec } from '../domain/specs/EllipseSpec.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import type { SvgAttributes } from './SvgAttributes.js';
import { SvgStyledElement } from './SvgStyledElement.js';

export class SvgEllipseElement extends SvgStyledElement {
  readonly #cx: number;
  readonly #cy: number;
  readonly #rx: number;
  readonly #ry: number;

  public constructor(attributes: SvgAttributes) {
    attributes.requireSupported([
      'id',
      'cx',
      'cy',
      'rx',
      'ry',
      'fill',
      'stroke',
      'stroke-width'
    ]);
    super('ellipse', attributes.optionalId(), attributes.style());
    this.#cx = attributes.requireNumber('cx');
    this.#cy = attributes.requireNumber('cy');
    this.#rx = attributes.requireNumber('rx');
    this.#ry = attributes.requireNumber('ry');
  }

  protected override createSpec(id: string): ShapeSpec {
    return new EllipseSpec(
      id,
      this.#cx,
      this.#cy,
      this.#rx,
      this.#ry,
      this.style
    );
  }
}
