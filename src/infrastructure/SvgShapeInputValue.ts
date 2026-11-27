import type { SvgShapeInput } from '../application/ports/SvgShapeInput.js';
import type { ShapeStyle } from '../domain/shapes/ShapeStyle.js';
import type { SvgAttributes } from './SvgAttributes.js';

export class SvgShapeInputValue implements SvgShapeInput {
  public constructor(
    private readonly shapeId: string,
    private readonly sourceText: string,
    private readonly attributes: SvgAttributes
  ) {
    Object.freeze(this);
  }

  public get id(): string {
    return this.shapeId;
  }

  public get text(): string {
    return this.sourceText;
  }

  public requireSupported(names: readonly string[]): void {
    this.attributes.requireSupported(names);
  }

  public requireNumber(name: string): number {
    return this.attributes.requireNumber(name);
  }

  public style(): ShapeStyle {
    return this.attributes.style();
  }
}
