import type { ShapeProvider } from './ShapeProvider.js';

export interface ShapeCatalog {
  findShape(name: string): ShapeProvider | undefined;
  shapeSyntaxes(): readonly string[];
}
