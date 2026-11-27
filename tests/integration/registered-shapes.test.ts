import { describe, expect, it } from 'vitest';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';
import { RegistrationTestPlugin } from '../support/RegistrationTestPlugin.js';
import { RectShapeProvider } from '../../src/plugins/builtin-shapes/RectShapeProvider.js';
import { CommandNumberParser } from '../../src/application/commands/support/CommandNumberParser.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';

describe('registered shape creation', () => {
  it('assembles the six default providers in the Phase 1 help order', async () => {
    const harness = await ApplicationHarness.create(new RecordingDocumentStore());
    expect(harness.plugins.shapes.values().map((provider) => provider.name))
      .toEqual(['rect', 'circle', 'ellipse', 'line', 'text', 'g']);
  });

  it.each([[], [''], ['create rect\ninvalid']].map((syntaxes) => ({ syntaxes })))(
    'rejects invalid shape help metadata $syntaxes', async ({ syntaxes }) => {
    const harness = await ApplicationHarness.create(new RecordingDocumentStore(), null);
    const provider = new RectShapeProvider(new CommandNumberParser());
    Object.defineProperty(provider, 'syntaxes', { value: syntaxes });
    await expect(harness.plugins.activate('invalid', new RegistrationTestPlugin((context) => {
      context.registerShape(provider);
    }))).rejects.toThrow('invalid shape syntax: rect');
    expect(harness.plugins.shapes.values()).toEqual([]);
    }
  );

  it('uses registered providers for creation and help, including later activations', async () => {
    const harness = await ApplicationHarness.create(new RecordingDocumentStore(), null);
    await harness.repl.executeLine('init');
    expect(await harness.repl.executeLine('create rect r1 0 0 2 3')).toContain('unknown shape type: rect');
    expect(await harness.repl.executeLine('help')).not.toContain('create rect');
    await harness.plugins.activate('rect', new RegistrationTestPlugin((context) => {
      context.registerShape(new RectShapeProvider(new CommandNumberParser()));
    }));
    expect(await harness.repl.executeLine('help')).toContain('create rect');
    expect(await harness.repl.executeLine('create rect r1 0 0 2 3')).toBe('rect#r1 created');
    expect(await harness.repl.executeLine('undo')).toBe('rect#r1 creation undone');
    expect(await harness.repl.executeLine('redo')).toBe('rect#r1 created');
  });

  it('does not publish failed providers into creation or help', async () => {
    const harness = await ApplicationHarness.create(new RecordingDocumentStore(), null);
    const before = await harness.repl.executeLine('help');
    await expect(harness.plugins.activate('failed', new RegistrationTestPlugin((context) => {
      context.registerShape(new RectShapeProvider(new CommandNumberParser()));
      throw new Error('failed');
    }))).rejects.toThrow('plugin failed');
    expect(await harness.repl.executeLine('help')).toBe(before);
    await harness.repl.executeLine('init');
    expect(await harness.repl.executeLine('create rect r1 0 0 1 1')).toContain('unknown shape type: rect');
  });

  it('rejects a provider returning the wrong id without changing redo', async () => {
    const harness = await ApplicationHarness.create(new RecordingDocumentStore(), null);
    const provider = new RectShapeProvider(new CommandNumberParser());
    await harness.plugins.activate('invalid', new RegistrationTestPlugin((context) => context.registerShape(provider)));
    await harness.repl.executeLine('init');
    await harness.repl.executeLine('create rect r1 0 0 1 1');
    await harness.repl.executeLine('undo');
    Object.defineProperty(provider, 'createSpec', { value: () => new RectSpec('wrong', 0, 0, 1, 1) });
    expect(await harness.repl.executeLine('create rect requested 0 0 1 1')).toBe('error: invalid shape specification: rect');
    expect(harness.history.undoCount()).toBe(0);
    expect(harness.history.redoCount()).toBe(1);
    expect(await harness.repl.executeLine('tree')).toBe('svg (800x600)');
    expect(await harness.repl.executeLine('redo')).toBe('rect#r1 created');
  });

  it('passes only read-only relationship operations to specification construction', async () => {
    const { SvgDocument } = await import('../../src/domain/document/SvgDocument.js');
    const document = new SvgDocument(100, 100);
    const spec = new RectSpec('r1', 0, 0, 1, 1);
    const create = spec.create.bind(spec);
    Object.defineProperty(spec, 'create', { value: (relations: Parameters<typeof create>[0]) => {
      expect(Object.keys(relations).sort()).toEqual(['childrenOf', 'parentOf']);
      expect(Object.isFrozen(relations)).toBe(true);
      return create(relations);
    } });
    expect(document.createShape(spec).id).toBe('r1');
  });

  it('rejects a malformed domain creation result before inserting into the tree', async () => {
    const { SvgDocument } = await import('../../src/domain/document/SvgDocument.js');
    const document = new SvgDocument(100, 100);
    const spec = new RectSpec('r1', 0, 0, 1, 1);
    Object.defineProperty(spec, 'create', { value: () => undefined });
    expect(() => document.createShape(spec)).toThrow('invalid shape specification: rect');
    expect(document.elementCount).toBe(0);
  });
});
