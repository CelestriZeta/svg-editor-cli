import { describe, expect, it } from 'vitest';
import { readFile, writeFile, readdir, realpath } from 'node:fs/promises';
import { dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { PluginRegistry } from '../../src/application/extensions/PluginRegistry.js';
import { BuiltinShapesPlugin } from '../../src/plugins/builtin-shapes/BuiltinShapesPlugin.js';
import { DocumentViewVisitor } from '../../src/application/queries/DocumentViewVisitor.js';
import { SvgReader } from '../../src/infrastructure/SvgReader.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { TreeFormatter } from '../../src/cli/TreeFormatter.js';
import { MarkedGroupSpec } from '../support/MarkedGroupSpec.js';
import { MarkedGroupProvider } from '../support/MarkedGroupProvider.js';
import { RegistrationTestPlugin } from '../support/RegistrationTestPlugin.js';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { TemporaryDirectory } from '../support/TemporaryDirectory.js';
import { SvgDocumentStore } from '../../src/infrastructure/SvgDocumentStore.js';
import { DomainError } from '../../src/domain/DomainError.js';
import { SvgShapeOutput } from '../../src/application/ports/SvgShapeOutput.js';

async function catalog(custom = true): Promise<PluginRegistry> {
  const registry = new PluginRegistry();
  await registry.activate('builtin-shapes', new BuiltinShapesPlugin());
  if (custom) await registry.activate('marked', new RegistrationTestPlugin((context) => {
    context.registerShape(new MarkedGroupProvider());
  }));
  return registry;
}

describe('provider query and SVG round-trip', () => {
  it('projects and round-trips an independently defined container without specific visitor methods', async () => {
    const registry = await catalog();
    const document = new SvgDocument(100, 50);
    document.createShape(new MarkedGroupSpec('m1'));
    document.createShape(new RectSpec('r1', 1, 2, 3, 4), document.requireContainer('m1'));
    const query = new DocumentViewVisitor(registry);
    const before = query.visit(document);
    expect(before.children[0]?.kind).toBe('marked');
    expect(new TreeFormatter().format(before)).toContain('g#m1');
    const writer = new SvgWriteVisitor(registry);
    const source = writer.serialize(document);
    expect(source).toContain('<g id="m1" data-kind="marked">');
    const restored = new SvgReader(registry).read(source).document;
    expect(restored.requireShape('m1').type).toBe('marked');
    expect(restored.parentOf('r1')?.id).toBe('m1');
    expect(query.visit(restored)).toEqual(before);
    expect(writer.serialize(restored)).toBe(source);
  });

  it('falls back to ordinary SVG group when the marked provider is absent', async () => {
    const registry = await catalog(false);
    const source = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><g id="m1" data-kind="marked"><rect id="r1" x="0" y="0" width="1" height="1"/></g></svg>';
    const result = new SvgReader(registry).read(source).document;
    expect(result.requireShape('m1').type).toBe('g');
    expect(result.parentOf('r1')?.id).toBe('m1');
    expect(new SvgWriteVisitor(registry).serialize(result)).not.toContain('data-kind');
  });

  it('rejects marker/tag disagreement and duplicate ids instead of silently degrading', async () => {
    const registry = await catalog();
    const reader = new SvgReader(registry);
    expect(() => reader.read('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect id="m1" data-kind="marked" x="0" y="0" width="1" height="1"/></svg>')).toThrow('SVG tag does not match shape type: marked');
    expect(() => reader.read('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><g id="m1" data-kind="missing"><g id="m1"/></g></svg>')).toThrow('id already exists: m1');
  });

  it('rejects unregistered query and export types explicitly', async () => {
    const registry = await catalog(false);
    const document = new SvgDocument(10, 10);
    document.createShape(new MarkedGroupSpec('m1'));
    expect(() => new DocumentViewVisitor(registry).visit(document)).toThrow('unknown shape type: marked');
    expect(() => new SvgWriteVisitor(registry).serialize(document)).toThrow('unknown shape type: marked');
  });

  it('rejects invalid projection and import result objects', async () => {
    const registry = await catalog();
    const provider = registry.findShape('marked');
    if (provider === undefined) throw new Error('missing provider');
    const document = new SvgDocument(10, 10);
    document.createShape(new MarkedGroupSpec('m1'));
    Object.defineProperty(provider, 'project', { value: () => ({}) });
    expect(() => new DocumentViewVisitor(registry).visit(document)).toThrow('invalid shape projection: marked');
    Object.defineProperty(provider, 'decode', { value: () => new MarkedGroupSpec('wrong') });
    expect(() => new SvgReader(registry).read('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><g id="m1" data-kind="marked"/></svg>'))
      .toThrow('invalid imported shape specification: marked');
    expect(document.requireShape('m1').id).toBe('m1');
  });

  it('rejects qualified attributes even when a later plain attribute has the same local name', async () => {
    const registry = await catalog(false);
    expect(() => new SvgReader(registry).read('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect xml:id="shadow" id="real" x="0" y="0" width="1" height="1"/></svg>'))
      .toThrow('unsupported attribute: xml:id');
  });

  it('copies output attributes and rejects duplicate, reserved and invalid numeric attributes', () => {
    const attributes: [string, number][] = [['x', 1]];
    const output = new SvgShapeOutput(attributes);
    attributes[0]![1] = 2;
    expect(output.attributes).toEqual([['x', 1]]);
    expect(Object.isFrozen(output.attributes[0])).toBe(true);
    expect(() => new SvgShapeOutput([['id', 'override']])).toThrow('invalid SVG output attribute');
    expect(() => new SvgShapeOutput([['x', 1], ['x', 2]])).toThrow('invalid SVG output attribute');
    expect(() => new SvgShapeOutput([['x', Number.NaN]])).toThrow('invalid SVG output attribute');
  });

  it('keeps the document, default path, redo and file bytes after provider read/write failures', async () => {
    const directory = await TemporaryDirectory.create('svg-provider-failure-');
    try {
      const registry = await catalog();
      const provider = registry.findShape('marked');
      expect(provider).toBeDefined();
      if (provider === undefined) throw new Error('missing marked provider');
      const store = new SvgDocumentStore(new SvgReader(registry), new SvgWriteVisitor(registry));
      const harness = await ApplicationHarness.create(store);
      await harness.plugins.activate('marked', new RegistrationTestPlugin((context) => context.registerShape(provider)));
      const stable = directory.file('stable.svg').replaceAll('\\', '/');
      const input = directory.file('invalid.svg').replaceAll('\\', '/');
      await harness.repl.executeLine('init 100 50');
      await harness.repl.executeLine('create rect r1 1 2 3 4');
      await harness.repl.executeLine('save "' + stable + '"');
      await harness.repl.executeLine('move r1 2 0');
      await harness.repl.executeLine('undo');
      const tree = await harness.repl.executeLine('tree');
      await writeFile(input, '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><g id="m1" data-kind="marked"><rect id="child" x="0" y="0" width="1" height="1"/></g></svg>');
      Object.defineProperty(provider, 'validateImported', { value: () => { throw new DomainError('invalid marked structure'); } });
      expect(await harness.repl.executeLine('read "' + input + '"')).toBe('error: invalid marked structure');
      expect(await harness.repl.executeLine('tree')).toBe(tree);
      expect(harness.history.redoCount()).toBe(1);
      await harness.repl.executeLine('redo');
      expect(await harness.repl.executeLine('save')).toContain('saved to ' + stable);

      await harness.repl.executeLine('create marked m1');
      await harness.repl.executeLine('save');
      await harness.repl.executeLine('move r1 2 0');
      await harness.repl.executeLine('undo');
      const bytes = await readFile(stable);
      const before = await harness.repl.executeLine('tree');
      const entries = await readdir(directory.path);
      Object.defineProperty(provider, 'encode', { value: () => { throw new Error('encoding failed'); } });
      expect(await harness.repl.executeLine('save')).toBe('error: cannot write file: ' + stable);
      expect(await readFile(stable)).toEqual(bytes);
      expect(await readdir(directory.path)).toEqual(entries);
      expect(await harness.repl.executeLine('tree')).toBe(before);
      expect(harness.history.redoCount()).toBe(1);
    } finally {
      const resolved = await realpath(directory.path);
      expect(dirname(resolved)).toBe(await realpath(tmpdir()));
      expect(basename(resolved).startsWith('svg-provider-failure-')).toBe(true);
      await directory.dispose();
    }
  });
});
