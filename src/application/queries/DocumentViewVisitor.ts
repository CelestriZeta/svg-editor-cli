import type { Shape } from '../../domain/shapes/Shape.js';
import { ContainerShape } from '../../domain/shapes/ContainerShape.js';
import { DomainError } from '../../domain/DomainError.js';
import { ShapeVisitor } from '../../domain/visitor/ShapeVisitor.js';
import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ShapeCatalog } from '../extensions/ShapeCatalog.js';
import { DocumentView } from './DocumentView.js';
import { GeometrySnapshot } from './GeometrySnapshot.js';
import { ShapeReference } from './ShapeReference.js';
import { ShapeSnapshot } from './ShapeSnapshot.js';
import type { DocumentQuery } from './DocumentQuery.js';

export class DocumentViewVisitor extends ShapeVisitor<ShapeSnapshot> implements DocumentQuery {
  public constructor(
    private readonly catalog: ShapeCatalog,
    private readonly recursive = true
  ) {
    super();
  }

  public visit(document: SvgDocument): DocumentView {
    return new DocumentView(document.width, document.height,
      [...document.children].map((shape) => this.visitSubtree(shape)));
  }
  public visitSubtree(shape: Shape): ShapeSnapshot {
    return shape.accept(this);
  }

  public inspect(shape: Shape): ShapeSnapshot {
    return new DocumentViewVisitor(this.catalog, false).visitSubtree(shape);
  }

  public enterContainer(): boolean {
    return this.recursive;
  }

  public leaveContainer(shape: ContainerShape, children: readonly ShapeSnapshot[]): ShapeSnapshot {
    return this.snapshot(shape, children);
  }
  public visitShape(shape: Shape): ShapeSnapshot {
    return this.snapshot(shape, []);
  }

  private snapshot(shape: Shape, children: readonly ShapeSnapshot[]): ShapeSnapshot {
    const provider = this.catalog.findShape(shape.type);
    if (provider === undefined) {
      throw new DomainError('unknown shape type: ' + shape.type);
    }
    const geometry = provider.project(shape);
    if (!(geometry instanceof GeometrySnapshot)) {
      throw new DomainError('invalid shape projection: ' + shape.type);
    }
    const parent = shape.parent;
    const parentProvider = parent === undefined ? undefined : this.catalog.findShape(parent.type);
    return new ShapeSnapshot(new ShapeReference(provider.svgTag, shape.id), geometry,
      shape.fill, shape.stroke, shape.strokeWidth,
      parent === undefined ? undefined : new ShapeReference(parentProvider?.svgTag ?? parent.type, parent.id),
      children, shape.type, shape instanceof ContainerShape);
  }
}
