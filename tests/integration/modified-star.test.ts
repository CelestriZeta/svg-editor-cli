import { LoadedDocument } from '../../src/application/ports/LoadedDocument.js';
import { describe,expect,it } from 'vitest';
import { ModifiedStarDecorator } from '../../src/plugins/modified-star/ModifiedStarDecorator.js';
import { TreeLineContext } from '../../src/application/extensions/TreeLineContext.js';
import { DocumentViewVisitor } from '../../src/application/queries/DocumentViewVisitor.js';
import { DocumentCheckpoints } from '../../src/application/DocumentCheckpoints.js';
import { DocumentService } from '../../src/application/DocumentService.js';
import { EditorSession } from '../../src/application/EditorSession.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';
import { TestShapeCatalog } from '../support/TestShapeCatalog.js';
import { TreeFormatter } from '../../src/cli/TreeFormatter.js';
import { ShapeFormatter } from '../../src/cli/ShapeFormatter.js';
import { BoxProvider } from '../../src/plugins/shape-box/BoxProvider.js';
import { BoxTypeDecorator } from '../../src/plugins/shape-box/BoxTypeDecorator.js';
import { PluginRegistry } from '../../src/application/extensions/PluginRegistry.js';
import { BoxPlugin } from '../../src/plugins/shape-box/BoxPlugin.js';
import { BuiltinShapesPlugin } from '../../src/plugins/builtin-shapes/BuiltinShapesPlugin.js';

describe('modified-star independent state machine',()=>{
  it('tracks content equality, creation, ancestors, save, edit, undo and redo',()=>{
    const query=new DocumentViewVisitor(new TestShapeCatalog());const checkpoints=new DocumentCheckpoints(query);
    const star=new ModifiedStarDecorator(checkpoints);const doc=new SvgDocument(100,100);
    const labels=()=>star.labels(new TreeLineContext(query.visit(doc)));
    checkpoints.capture(doc);expect(labels()).toEqual([]);
    doc.createShape(new GroupSpec('g'));doc.createShape(new RectSpec('r',0,0,1,1),doc.requireContainer('g'));
    expect(labels()).toEqual(['*']);
    checkpoints.capture(doc);expect(labels()).toEqual([]);
    const change=doc.requireShape('r').prepareSet(ShapeAttributeUpdate.text('fill','red'));change.apply();
    const view=query.visit(doc);expect(star.labels(new TreeLineContext(view,view.children[0]))).toEqual(['*']);
    expect(star.labels(new TreeLineContext(view,view.children[0]!.children[0]))).toEqual(['*']);
    change.revert();expect(labels()).toEqual([]);change.apply();expect(labels()).toEqual(['*']);
    checkpoints.capture(doc);expect(labels()).toEqual([]);
    const other=new ModifiedStarDecorator(new DocumentCheckpoints(query));expect(other.labels(new TreeLineContext(query.visit(doc)))).toEqual(['*']);
  });
  it('keeps dirty after failed save and clears on successful save/read/init',async()=>{
    const query=new DocumentViewVisitor(new TestShapeCatalog());const checkpoints=new DocumentCheckpoints(query);const session=new EditorSession();let fail=true;
    const loaded=new SvgDocument(2,2);
    const service=new DocumentService(session,{save:async()=>{if(fail)throw Error('disk');},read:async()=>new LoadedDocument(loaded,[])},checkpoints);
    const star=new ModifiedStarDecorator(checkpoints);service.init(10,10);session.requireDocument().createShape(new RectSpec('r',0,0,1,1));
    const labels=()=>star.labels(new TreeLineContext(query.visit(session.requireDocument())));
    expect(labels()).toEqual(['*']);await expect(service.save('test.svg')).rejects.toThrow();expect(labels()).toEqual(['*']);
    fail=false;await service.save('test.svg');expect(labels()).toEqual([]);
    session.requireDocument().resizeCanvas(20,20);expect(labels()).toEqual(['*']);await service.read('other.svg');expect(labels()).toEqual([]);
    service.init(1,1);expect(labels()).toEqual([]);
  });
  it('coexists with box label in registration order without renderer changes',async()=>{
    const registry=new PluginRegistry();await registry.activate('builtin',new BuiltinShapesPlugin());await registry.activate('box',new BoxPlugin());
    const query=new DocumentViewVisitor(registry);const checkpoints=new DocumentCheckpoints(query);const doc=new SvgDocument(10,10);checkpoints.capture(doc);
    doc.createShape(new BoxProvider().createSpec('n',['0','0','1','1','x']));
    const format=new TreeFormatter(new ShapeFormatter(),{treeDecorators:()=>[new BoxTypeDecorator(),new ModifiedStarDecorator(checkpoints)]});
    expect(format.format(query.visit(doc))).toContain('g#n (box) *');
  });
});
