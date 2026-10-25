import type { ShapeSnapshot } from '../application/queries/ShapeSnapshot.js';

export class ShapeFormatter {
  public label(shape: ShapeSnapshot): string {
    return `${shape.type}#${shape.id}`;
  }

  public geometry(shape: ShapeSnapshot): readonly string[] {
    const geometry = shape.geometry;
    const anchor = geometry.anchor;
    if (anchor !== undefined && geometry.end !== undefined) {
      return [`(${anchor.x},${anchor.y}) -> (${geometry.end.x},${geometry.end.y})`];
    }
    if (anchor !== undefined && geometry.content !== undefined) {
      return [`(${anchor.x},${anchor.y})`, `"${geometry.content}"`];
    }
    return geometry.attributes.map(([name, value]) => {
      const label = name === 'width' ? 'w' : name === 'height' ? 'h' : name;
      return `${label}=${value}`;
    });
  }

  public style(shape: ShapeSnapshot): readonly string[] {
    const attributes: string[] = [];
    if (shape.fill !== undefined) {
      attributes.push(`fill=${shape.fill}`);
    }
    if (shape.stroke !== undefined) {
      attributes.push(`stroke=${shape.stroke}`);
    }
    if (shape.strokeWidth !== undefined) {
      attributes.push(`stroke-width=${shape.strokeWidth}`);
    }
    return attributes;
  }

  public inline(shape: ShapeSnapshot): string {
    const label = this.label(shape);
    const paddedLabel = label.padEnd(Math.max(15, label.length + 1));
    const attributes = [...this.geometry(shape), ...this.style(shape)];
    return `${paddedLabel}${attributes.join(' ')}`.trimEnd();
  }
}
