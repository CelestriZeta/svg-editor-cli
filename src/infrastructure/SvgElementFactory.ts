import { DomainError } from '../domain/DomainError.js';
import type { SaxesAttributeNS } from 'saxes';
import { SvgAttributes } from './SvgAttributes.js';
import { SvgCircleElement } from './SvgCircleElement.js';
import { SvgEllipseElement } from './SvgEllipseElement.js';
import type { SvgElement } from './SvgElement.js';
import { SvgGroupElement } from './SvgGroupElement.js';
import { SvgLineElement } from './SvgLineElement.js';
import { SvgRectElement } from './SvgRectElement.js';
import { SvgTextElement } from './SvgTextElement.js';

type ElementBuilder = (attributes: SvgAttributes) => SvgElement;

export class SvgElementFactory {
  readonly #builders: ReadonlyMap<string, ElementBuilder>;

  public constructor() {
    this.#builders = new Map<string, ElementBuilder>([
      ['rect', (attributes) => new SvgRectElement(attributes)],
      ['circle', (attributes) => new SvgCircleElement(attributes)],
      ['ellipse', (attributes) => new SvgEllipseElement(attributes)],
      ['line', (attributes) => new SvgLineElement(attributes)],
      ['text', (attributes) => new SvgTextElement(attributes)],
      ['g', (attributes) => new SvgGroupElement(attributes)]
    ]);
  }

  public create(
    tagName: string,
    attributes: Record<string, SaxesAttributeNS>
  ): SvgElement {
    const builder = this.#builders.get(tagName);
    if (builder === undefined) {
      throw new DomainError(`unsupported element: ${tagName}`);
    }
    return builder(new SvgAttributes(tagName, attributes));
  }
}
