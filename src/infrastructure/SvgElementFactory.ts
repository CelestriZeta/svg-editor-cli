import { DomainError } from '../domain/DomainError.js';
import type { SaxesAttributeNS } from 'saxes';
import type { ShapeCatalog } from '../application/extensions/ShapeCatalog.js';
import { SvgAttributes } from './SvgAttributes.js';
import { SvgElement } from './SvgElement.js';

export class SvgElementFactory {
  public constructor(private readonly catalog: ShapeCatalog) {}
  public create(tagName: string, raw: Record<string, SaxesAttributeNS>): SvgElement {
    const attributes = new SvgAttributes(tagName, raw, true);
    const kind = attributes.optional('data-kind');
    if (kind !== undefined && kind.trim().length === 0) throw new DomainError('invalid SVG shape kind');
    const marked = kind === undefined ? undefined : this.catalog.findShape(kind);
    const provider = marked ?? this.catalog.findShape(tagName);
    if (provider === undefined) throw new DomainError('unsupported element: ' + tagName);
    if (provider.svgTag !== tagName) throw new DomainError('SVG tag does not match shape type: ' + provider.name);
    return new SvgElement(tagName, attributes, provider);
  }
}
