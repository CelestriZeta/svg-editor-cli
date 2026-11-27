import type { ShapeSnapshot } from '../../application/queries/ShapeSnapshot.js';
import type { DocumentView } from '../../application/queries/DocumentView.js';
export class ContentFingerprint {
  public shape(shape: ShapeSnapshot): string {return JSON.stringify(this.value(shape));}
  public document(view: DocumentView): string {return JSON.stringify([view.width,view.height,view.children.map(s=>this.value(s))]);}
  private value(shape: ShapeSnapshot): readonly unknown[] {
    return [shape.kind,shape.type,shape.id,shape.parent?.type,shape.parent?.id,
      shape.geometry.attributes,shape.geometry.content,shape.fill,shape.stroke,shape.strokeWidth,
      shape.children.map(s=>this.value(s))];
  }
}
