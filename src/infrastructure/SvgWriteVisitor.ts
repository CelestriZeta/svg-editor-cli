import type { SvgDocument } from '../domain/document/SvgDocument.js';
import type { Rect } from '../domain/shapes/Rect.js';
import type { ShapeVisitor } from '../domain/visitor/ShapeVisitor.js';

export class SvgWriteVisitor implements ShapeVisitor<string> {
  public serialize(document: SvgDocument): string {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}">`
    ];

    for (const shape of document.children) {
      lines.push(`  ${shape.accept(this)}`);
    }

    lines.push('</svg>', '');
    return lines.join('\n');
  }

  public visitRect(rect: Rect): string {
    const attributes = [
      `id="${this.escape(rect.id)}"`,
      `x="${rect.x}"`,
      `y="${rect.y}"`,
      `width="${rect.width}"`,
      `height="${rect.height}"`
    ];

    if (rect.fill !== undefined) {
      attributes.push(`fill="${this.escape(rect.fill)}"`);
    }

    return `<rect ${attributes.join(' ')}/>`;
  }

  private escape(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}
