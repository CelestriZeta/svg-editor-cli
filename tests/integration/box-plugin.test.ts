import { describe, expect, it } from 'vitest';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';
import { BoxPlugin } from '../../src/plugins/shape-box/BoxPlugin.js';
import { BoxProvider } from '../../src/plugins/shape-box/BoxProvider.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { SvgReader } from '../../src/infrastructure/SvgReader.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';
import { PluginRegistry } from '../../src/application/extensions/PluginRegistry.js';

async function setup(){const h=await ApplicationHarness.create(new RecordingDocumentStore());await h.plugins.activate('box',new BoxPlugin());await h.repl.executeLine('init');return h;}
describe('box plugin',()=>{
  it('is independently registerable and creates a whole subtree with public domain API',async()=>{
    const registry=new PluginRegistry();await registry.activate('box',new BoxPlugin());
    expect(registry.shapes.values().map(s=>s.name)).toEqual(['box']);
    const doc=new SvgDocument(100,100);const spec=new BoxProvider().createSpec('n',['10','20','30','40','title']);
    doc.createShape(spec);expect(doc.elementCount).toBe(3);
    expect(doc.requireShape('n-rect').fill).toBe('#4a90d9');
    expect(()=>doc.prepareDeleteShape('n-label')).toThrow('invalid box parts');
    expect(()=>doc.prepareUngroup('n')).toThrow('cannot ungroup composite');
  });
  it('supports nested create/move/group, part protection, atomic delete and history',async()=>{
    const h=await setup();await h.repl.executeLine('create g outer');
    expect(await h.repl.executeLine('create box n 10 20 30 40 "hello" in outer')).toBe('box#n created in g#outer');
    await h.repl.executeLine('create box inner 0 0 3 4 "child" in n');
    await h.repl.executeLine('move n 10 0');expect(await h.repl.executeLine('show inner-rect')).toContain('x=10');
    for(const command of ['delete n-rect','addto outer n-label','group stolen n-label','ungroup n'])expect(await h.repl.executeLine(command)).toMatch(/^error:/);
    const before=await h.repl.executeLine('tree');await h.repl.executeLine('delete n');await h.repl.executeLine('undo');expect(await h.repl.executeLine('tree')).toBe(before);
    await h.repl.executeLine('redo');expect(await h.repl.executeLine('show n')).toBe('error: no such shape: n');
  });
  it('sets propagated fill and label as separate one-command undo units',async()=>{
    const h=await setup();await h.repl.executeLine('create box n 0 0 30 40 "title"');
    expect(await h.repl.executeLine('set n fill red')).toBe('box#n updated: fill=red');
    await h.repl.executeLine('undo');expect(await h.repl.executeLine('show n-rect')).toContain('fill=#4a90d9');
    await h.repl.executeLine('redo');expect(await h.repl.executeLine('show n-rect')).toContain('fill=red');
    expect(await h.repl.executeLine('set n label "new title"')).toBe('box#n updated: label=new title');
    await h.repl.executeLine('undo');expect(await h.repl.executeLine('show n-label')).toContain('"title"');
    await h.repl.executeLine('redo');expect(await h.repl.executeLine('show n-label')).toContain('"new title"');
  });
  it('rejects full subtree ID collisions with no partial nodes',()=>{
    const doc=new SvgDocument(100,100);doc.createShape(new RectSpec('n-label',0,0,1,1));
    expect(()=>doc.createShape(new BoxProvider().createSpec('n',['0','0','1','1','x']))).toThrow('id already exists');
    expect(doc.elementCount).toBe(1);expect(doc.findShape('n')).toBeUndefined();expect(doc.findShape('n-rect')).toBeUndefined();
  });
  it('round trips, degrades without plugin and rejects invalid parts',async()=>{
    const h=await setup();const doc=new SvgDocument(100,100);doc.createShape(new BoxProvider().createSpec('n',['0','0','10','10','x & y']));
    const xml=new SvgWriteVisitor(h.plugins).serialize(doc);expect(xml).toContain('data-kind="box"');
    const loaded=new SvgReader(h.plugins).read(xml).document;expect(loaded.requireShape('n').type).toBe('box');expect(new SvgWriteVisitor(h.plugins).serialize(loaded)).toBe(xml);
    const base=await ApplicationHarness.create(new RecordingDocumentStore());expect(new SvgReader(base.plugins).read(xml).document.requireShape('n').type).toBe('g');
    for(const broken of [xml.replace(/<text[^>]*>.*?<\/text>/,''),xml.replace('id="n-rect"','id="wrong"'),xml.replace('id="n-label"','id="n-rect"')])expect(()=>new SvgReader(h.plugins).read(broken)).toThrow();
  });
});
