import { describe, expect, it } from 'vitest';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';
import { StatsPlugin } from '../../src/plugins/stats/StatsPlugin.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { DocumentViewVisitor } from '../../src/application/queries/DocumentViewVisitor.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { CircleSpec } from '../../src/domain/specs/CircleSpec.js';
describe('stats plugin', () => {
  it('registers independently, counts depth first and leaves redo untouched', async () => {
    const h=await ApplicationHarness.create(new RecordingDocumentStore());
    expect(await h.repl.executeLine('stats')).toBe('error: unknown command: stats');
    const doc=new SvgDocument(10,10); const query=new DocumentViewVisitor(h.plugins);
    await h.plugins.activate('stats',new StatsPlugin({documents:{requireDocument:()=>doc},query}));
    expect(await h.repl.executeLine('stats')).toBe('(total 0, containers 0)');
    doc.createShape(new GroupSpec('g')); doc.createShape(new CircleSpec('c',1,1,1),doc.requireContainer('g'));
    doc.createShape(new RectSpec('r',0,0,1,1)); doc.createShape(new CircleSpec('c2',1,1,1));
    expect(await h.repl.executeLine('stats')).toBe('circle: 2  rect: 1  (total 3, containers 1)');
    expect(await h.repl.executeLine('help')).toContain('  stats');
    expect(await h.repl.executeLine('stats x')).toBe('error: stats takes no arguments');
    await h.repl.executeLine('init');await h.repl.executeLine('create rect undoable 0 0 1 1');await h.repl.executeLine('undo');
    await h.repl.executeLine('stats'); expect(h.history.redoCount()).toBe(1);
  });
});
