import { expect,it } from 'vitest';
import { ModifiedStarPlugin } from '../../src/plugins/modified-star/ModifiedStarPlugin.js';
import type { TreeDecorator } from '../../src/application/extensions/TreeDecorator.js';
import { DocumentView } from '../../src/application/queries/DocumentView.js';
import { TreeLineContext } from '../../src/application/extensions/TreeLineContext.js';
it('star uses an independent checkpoint substitute for edit/save/undo state',()=>{
  const initial=new DocumentView(10,10,[]),edited=new DocumentView(20,20,[]),later=new DocumentView(30,30,[]);
  const listeners:((v:DocumentView)=>void)[]=[],decorators:TreeDecorator[]=[];const unexpected=():never=>{throw Error('unexpected');};
  new ModifiedStarPlugin({checkpoints:{subscribe:listener=>{listeners.push(listener);listener(initial);return()=>{};}}})
    .activate({registerDecorator:d=>decorators.push(d),registerShape:unexpected,registerAttribute:unexpected,registerCommand:unexpected});
  const star=decorators[0]!;
  expect(star.labels(new TreeLineContext(initial))).toEqual([]);
  expect(star.labels(new TreeLineContext(edited))).toEqual(['*']);
  listeners[0]!(edited);expect(star.labels(new TreeLineContext(edited))).toEqual([]);
  expect(star.labels(new TreeLineContext(later))).toEqual(['*']);
  expect(star.labels(new TreeLineContext(edited))).toEqual([]);
});
