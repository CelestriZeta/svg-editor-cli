import { describe, expect, it } from 'vitest';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';
import { RegistrationTestPlugin } from '../support/RegistrationTestPlugin.js';
import { CompositeChangeSet } from '../../src/domain/CompositeChangeSet.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';
import type { AttributeHandler } from '../../src/application/extensions/AttributeHandler.js';

async function setup() {
  const h = await ApplicationHarness.create(new RecordingDocumentStore());
  await h.repl.executeLine('init');
  await h.repl.executeLine('create rect r 0 0 1 1');
  return h;
}
function handler(name: string, fail = false): AttributeHandler {
  return { name, handles: (s, a) => s.id === 'r' && a === 'label',
    prepare: (_, __, value, context) => ({
      changeSet: new CompositeChangeSet([
        context.prepareSet('r', ShapeAttributeUpdate.text('fill', value)),
        ...(fail ? [{ hasChanges: true, apply() { throw new Error('part failed'); }, revert() {} }] : [])
      ]), readValue: () => context.readAttribute('r', 'fill')
    }) };
}
describe('attribute handler transactions', () => {
  it('uses fallback and rejects unknown attributes', async () => {
    const h = await setup();
    expect(await h.repl.executeLine('set r fill red')).toBe('rect#r updated: fill=red');
    expect(await h.repl.executeLine('set r label x')).toBe('error: unknown attribute: label');
  });
  it('routes convenience attributes through one undo unit', async () => {
    const h = await setup();
    await h.plugins.activate('attr', new RegistrationTestPlugin(c => c.registerAttribute(handler('label'))));
    expect(await h.repl.executeLine('set r label red')).toBe('rect#r updated: label=red');
    await h.repl.executeLine('undo');
    expect(await h.repl.executeLine('show r')).not.toContain('fill=');
    await h.repl.executeLine('redo');
    expect(await h.repl.executeLine('show r')).toContain('fill=red');
  });
  it('rejects conflicts before preparing and keeps redo', async () => {
    const h = await setup();
    for (const name of ['a', 'b']) await h.plugins.activate(name, new RegistrationTestPlugin(c => c.registerAttribute(handler(name))));
    await h.repl.executeLine('set r fill blue'); await h.repl.executeLine('undo');
    expect(await h.repl.executeLine('set r label red')).toBe('error: ambiguous attribute handler: label');
    expect(h.history.redoCount()).toBe(1);
    expect(await h.repl.executeLine('show r')).not.toContain('fill=');
  });
  it('compensates a partially applied multi-part handler without fallback', async () => {
    const h = await setup();
    await h.plugins.activate('fault', new RegistrationTestPlugin(c => c.registerAttribute(handler('fault', true))));
    await h.repl.executeLine('set r fill blue'); await h.repl.executeLine('undo');
    expect(await h.repl.executeLine('set r label red')).toMatch(/^error:/);
    expect(h.history.redoCount()).toBe(1);
    expect(await h.repl.executeLine('show r')).not.toContain('fill=');
  });
});
