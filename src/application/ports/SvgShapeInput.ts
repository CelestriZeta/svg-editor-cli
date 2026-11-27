import type { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';

/** 已解析的输入能力，不暴露 XML 库、可写文档或内部树。 */
export interface SvgShapeInput {
  readonly id: string;
  readonly text: string;
  requireSupported(names: readonly string[]): void;
  requireNumber(name: string): number;
  style(): ShapeStyle;
}
