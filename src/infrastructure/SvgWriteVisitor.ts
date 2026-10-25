import type { SvgDocument } from '../domain/document/SvgDocument.js';
import type { Circle } from '../domain/shapes/Circle.js';
import type { Ellipse } from '../domain/shapes/Ellipse.js';
import type { Group } from '../domain/shapes/Group.js';
import type { Line } from '../domain/shapes/Line.js';
import type { Rect } from '../domain/shapes/Rect.js';
import type { Shape } from '../domain/shapes/Shape.js';
import type { Text } from '../domain/shapes/Text.js';
import { ShapeVisitor } from '../domain/visitor/ShapeVisitor.js';

export class SvgWriteVisitor extends ShapeVisitor<string> {
  public serialize(document: SvgDocument): string {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}">`
    ];

    for (const shape of document.children) {
      lines.push(
        ...shape
          .accept(this)
          .split('\n')
          .map((line) => `  ${line}`)
      );
    }

    lines.push('</svg>', '');
    return lines.join('\n');
  }

  public enterGroup(): boolean {
    return true;
  }

  public leaveGroup(group: Group, children: readonly string[]): string {
    const attributes = this.attributes(group.id, [], group);
    if (children.length === 0) {
      return `<g ${attributes}/>`;
    }

    const childLines = children.flatMap((child) =>
      child.split('\n').map((line) => `  ${line}`)
    );
    return [
      `<g ${attributes}>`,
      ...childLines,
      '</g>'
    ].join('\n');
  }

  public visitCircle(circle: Circle): string {
    const attributes = this.attributes(
      circle.id,
      [`cx="${circle.cx}"`, `cy="${circle.cy}"`, `r="${circle.r}"`],
      circle
    );
    return `<circle ${attributes}/>`;
  }

  public visitEllipse(ellipse: Ellipse): string {
    const attributes = this.attributes(
      ellipse.id,
      [
        `cx="${ellipse.cx}"`,
        `cy="${ellipse.cy}"`,
        `rx="${ellipse.rx}"`,
        `ry="${ellipse.ry}"`
      ],
      ellipse
    );
    return `<ellipse ${attributes}/>`;
  }

  public visitLine(line: Line): string {
    const attributes = this.attributes(
      line.id,
      [
        `x1="${line.x1}"`,
        `y1="${line.y1}"`,
        `x2="${line.x2}"`,
        `y2="${line.y2}"`
      ],
      line
    );
    return `<line ${attributes}/>`;
  }

  public visitRect(rect: Rect): string {
    const attributes = this.attributes(
      rect.id,
      [
        `x="${rect.x}"`,
        `y="${rect.y}"`,
        `width="${rect.width}"`,
        `height="${rect.height}"`
      ],
      rect
    );
    return `<rect ${attributes}/>`;
  }

  public visitText(text: Text): string {
    const attributes = this.attributes(
      text.id,
      [`x="${text.x}"`, `y="${text.y}"`],
      text
    );
    return `<text ${attributes}>${this.escape(text.content)}</text>`;
  }

  private attributes(
    id: string,
    geometry: readonly string[],
    shape: Shape
  ): string {
    const attributes = [`id="${this.escape(id)}"`, ...geometry];

    if (shape.fill !== undefined) {
      attributes.push(`fill="${this.escape(shape.fill)}"`);
    }
    if (shape.stroke !== undefined) {
      attributes.push(`stroke="${this.escape(shape.stroke)}"`);
    }
    if (shape.strokeWidth !== undefined) {
      attributes.push(`stroke-width="${shape.strokeWidth}"`);
    }

    return attributes.join(' ');
  }

  private escape(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}
