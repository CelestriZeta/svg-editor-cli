import { describe, expect, it } from 'vitest';
import { ArrowPlugin } from '../../src/plugins/shape-arrow/ArrowPlugin.js';
import { ArrowProvider } from '../../src/plugins/shape-arrow/ArrowProvider.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { SvgReader } from '../../src/infrastructure/SvgReader.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

async function setup() {
  const h = await ApplicationHarness.create(new RecordingDocumentStore());
  await h.plugins.activate('arrow', new ArrowPlugin());
  await h.repl.executeLine('init');
  return h;
}

describe('arrow integration with unchanged kernel', () => {
  it('discovers syntax, supports in/group/styles and command history', async () => {
    const h = await setup();
    expect(await h.repl.executeLine('help')).toContain('create arrow');
    await h.repl.executeLine('create g scene');
    expect(await h.repl.executeLine('create arrow a 0 0 60 0 red in scene')).toBe('arrow#a created in g#scene');
    expect(await h.repl.executeLine('tree a')).toContain('(0,0) -> (60,0)');
    await h.repl.executeLine('move a 10 5');
    expect(await h.repl.executeLine('show a-shaft')).toContain('(10,5) -> (70,5)');
    await h.repl.executeLine('undo'); await h.repl.executeLine('redo');
    await h.repl.executeLine('scale a 2');
    expect(await h.repl.executeLine('show a-shaft')).toContain('(20,10) -> (140,10)');
    await h.repl.executeLine('set a stroke blue');
    expect(await h.repl.executeLine('show a')).toContain('stroke=blue');
    await h.repl.executeLine('create circle b 10 10 2');
    expect(await h.repl.executeLine('group cluster a b')).toContain('2 children');
    const before = await h.repl.executeLine('tree');
    await h.repl.executeLine('delete a'); await h.repl.executeLine('undo');
    expect(await h.repl.executeLine('tree')).toBe(before);
  });

  it('protects required parts and redo on invalid create and structural operations', async () => {
    const h = await setup();
    await h.repl.executeLine('create arrow a 0 0 60 0');
    await h.repl.executeLine('move a 1 0'); await h.repl.executeLine('undo');
    const before = await h.repl.executeLine('tree');
    for (const command of ['delete a-shaft', 'create arrow a 0 0 1 1', 'create arrow bad 0 0 0 0',
      'group stolen a-head-left a-head-right', 'ungroup a', 'scale a 1e308', 'set a label bad']) {
      expect(await h.repl.executeLine(command)).toMatch(/^error:/);
      expect(h.history.redoCount()).toBe(1);
      expect(await h.repl.executeLine('tree')).toBe(before);
    }
    await h.repl.executeLine('create g other');
    expect(await h.repl.executeLine('addto other a-head-right')).toMatch(/^error:/);
  });

  it('checks descendant ids before publishing any part', async () => {
    const h = await setup(); await h.repl.executeLine('create line a-head-left 0 0 1 1');
    expect(await h.repl.executeLine('create arrow a 0 0 60 0')).toBe('error: id already exists: a-head-left');
    expect(await h.repl.executeLine('show a')).toBe('error: no such shape: a');
    expect(await h.repl.executeLine('show a-shaft')).toBe('error: no such shape: a-shaft');
  });

  it('round trips, degrades to g when disabled, rejects missing/wrong/duplicate parts', async () => {
    const h = await setup();
    const doc = new SvgDocument(200, 100);
    doc.createShape(new ArrowProvider().createSpec('a', ['0', '0', '60', '0']));
    const writer = new SvgWriteVisitor(h.plugins), reader = new SvgReader(h.plugins);
    const svg = writer.serialize(doc);
    expect(svg).toContain('data-kind="arrow"');
    expect(writer.serialize(reader.read(svg).document)).toBe(svg);
    const disabled = await ApplicationHarness.create(new RecordingDocumentStore());
    const fallback = new SvgReader(disabled.plugins).read(svg).document;
    expect(fallback.requireShape('a').type).toBe('g'); expect(fallback.elementCount).toBe(4);
    expect(await disabled.repl.executeLine('help')).not.toContain('create arrow');
    await disabled.repl.executeLine('init');
    expect(await disabled.repl.executeLine('create arrow a 0 0 1 1')).toContain('unknown shape type: arrow');
    for (const broken of [svg.replace(/<line id="a-head-left"[^>]*\/>/, ''),
      svg.replace('id="a-head-left"', 'id="a-shaft"'),
      svg.replace(/<line id="a-head-left"[^>]*\/>/, '<circle id="a-head-left" cx="1" cy="1" r="1"/>')]) {
      expect(() => reader.read(broken)).toThrow();
    }
  });
});
