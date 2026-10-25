import { ShapeStyle } from '../domain/shapes/ShapeStyle.js';
import { SvgElement } from './SvgElement.js';

export abstract class SvgStyledElement extends SvgElement {
  readonly #style: ShapeStyle;

  protected constructor(
    tagName: string,
    id: string | undefined,
    style: ShapeStyle
  ) {
    super(tagName, id);
    this.#style = style;
  }

  protected get style(): ShapeStyle {
    return this.#style;
  }
}
