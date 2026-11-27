import type { SvgDocument } from '../domain/document/SvgDocument.js';
import { ContainerShape } from '../domain/shapes/ContainerShape.js';
import type { Shape } from '../domain/shapes/Shape.js';
import { ShapeVisitor } from '../domain/visitor/ShapeVisitor.js';
import { DomainError } from '../domain/DomainError.js';
import type { ShapeCatalog } from '../application/extensions/ShapeCatalog.js';
import { SvgContentKind } from '../application/ports/SvgContentKind.js';
import { SvgShapeOutput } from '../application/ports/SvgShapeOutput.js';

export class SvgWriteVisitor extends ShapeVisitor<string> {
  public constructor(private readonly catalog: ShapeCatalog) { super(); }
  public serialize(document: SvgDocument): string {
    const lines = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + document.width + '" height="' + document.height +
      '" viewBox="0 0 ' + document.width + ' ' + document.height + '">'];
    for (const shape of document.children) lines.push(...shape.accept(this).split('\n').map((line) => '  ' + line));
    lines.push('</svg>', '');
    return lines.join('\n');
  }
  public enterContainer(): boolean { return true; }
  public leaveContainer(shape: ContainerShape, children: readonly string[]): string { return this.element(shape, children); }
  public visitShape(shape: Shape): string { return this.element(shape, []); }
  private element(shape: Shape, children: readonly string[]): string {
    const provider = this.catalog.findShape(shape.type);
    if (provider === undefined) throw new DomainError('unknown shape type: ' + shape.type);
    if (!/^[A-Za-z_][\w.-]*$/.test(provider.svgTag) ||
        (provider.content === SvgContentKind.Children) !== (shape instanceof ContainerShape)) {
      throw new DomainError('invalid SVG shape structure: ' + shape.type);
    }
    const output = provider.encode(shape);
    if (!(output instanceof SvgShapeOutput) ||
        (provider.content === SvgContentKind.Text) !== (output.text !== undefined)) {
      throw new DomainError('invalid SVG shape output: ' + shape.type);
    }
    const attributes = ['id="' + this.escape(shape.id) + '"',
      ...output.attributes.map(([name, value]) => name + '="' + this.escape(String(value)) + '"')];
    if (shape.fill !== undefined) attributes.push('fill="' + this.escape(shape.fill) + '"');
    if (shape.stroke !== undefined) attributes.push('stroke="' + this.escape(shape.stroke) + '"');
    if (shape.strokeWidth !== undefined) attributes.push('stroke-width="' + shape.strokeWidth + '"');
    if (provider.name !== provider.svgTag) attributes.push('data-kind="' + this.escape(provider.name) + '"');
    const open = '<' + provider.svgTag + ' ' + attributes.join(' ');
    if (output.text !== undefined) return open + '>' + this.escape(output.text) + '</' + provider.svgTag + '>';
    if (children.length === 0) return open + '/>';
    return [open + '>', ...children.flatMap((child) => child.split('\n').map((line) => '  ' + line)),
      '</' + provider.svgTag + '>'].join('\n');
  }
  private escape(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }
}
