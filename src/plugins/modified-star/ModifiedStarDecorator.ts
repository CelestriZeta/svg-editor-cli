import type { TreeDecorator } from '../../application/extensions/TreeDecorator.js';
import type { TreeLineContext } from '../../application/extensions/TreeLineContext.js';
import type { DocumentView } from '../../application/queries/DocumentView.js';
import type { ShapeSnapshot } from '../../application/queries/ShapeSnapshot.js';
import type { CheckpointSource } from '../../application/ports/CheckpointSource.js';
import { ContentFingerprint } from './ContentFingerprint.js';
export class ModifiedStarDecorator implements TreeDecorator {
  public readonly name='modified-star';
  readonly #fingerprint=new ContentFingerprint();
  readonly #saved=new Map<string,string>();
  #document=''; #subscribed=false;
  public constructor(private readonly checkpoints: CheckpointSource) {}
  public labels(context: TreeLineContext): readonly string[] {
    // 延迟订阅：失败的插件注册不会留下观察者；源回放最近成功的保存点。
    if(!this.#subscribed){this.checkpoints.subscribe(view=>this.capture(view));this.#subscribed=true;}
    const shape=context.shape;
    const dirty=shape===undefined?this.#fingerprint.document(context.document)!==this.#document:
      this.#saved.get(shape.id)!==this.#fingerprint.shape(shape);
    return dirty?['*']:[];
  }
  private capture(view: DocumentView): void {
    this.#saved.clear();this.#document=this.#fingerprint.document(view);
    const walk=(shape: ShapeSnapshot):void=>{this.#saved.set(shape.id,this.#fingerprint.shape(shape));shape.children.forEach(walk);};
    view.children.forEach(walk);
  }
}
