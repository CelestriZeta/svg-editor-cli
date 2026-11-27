import { describe, expect, it } from 'vitest';
import { PluginRegistry } from '../../src/application/extensions/PluginRegistry.js';
import { BuiltinShapesPlugin } from '../../src/plugins/builtin-shapes/BuiltinShapesPlugin.js';
import { SvgReader } from '../../src/infrastructure/SvgReader.js';
import { SvgWriteVisitor } from '../../src/infrastructure/SvgWriteVisitor.js';
import { GuardedProvider } from '../support/GuardedProvider.js';
import { RegistrationTestPlugin } from '../support/RegistrationTestPlugin.js';
import { TemporaryDirectory } from '../support/TemporaryDirectory.js';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { SvgDocumentStore } from '../../src/infrastructure/SvgDocumentStore.js';
import { writeFile, realpath } from 'node:fs/promises';
import { dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';

async function readerAndWriter(): Promise<{ reader: SvgReader; writer: SvgWriteVisitor }> {
  const registry = new PluginRegistry();
  await registry.activate('builtins', new BuiltinShapesPlugin());
  await registry.activate('guarded', new RegistrationTestPlugin((context) => context.registerShape(new GuardedProvider())));
  return { reader: new SvgReader(registry), writer: new SvgWriteVisitor(registry) };
}

describe('complete composite SVG assembly', () => {
  it('installs actual nested SVG children before validating protected containers', async () => {
    const { reader, writer } = await readerAndWriter();
    const source = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><g id="p" data-kind="guarded"><rect id="p-core" x="1" y="2" width="3" height="4"/><g id="q" data-kind="guarded"><rect id="q-core" x="5" y="6" width="7" height="8"/></g></g></svg>';
    const document = reader.read(source).document;
    expect(document.elementCount).toBe(4);
    expect(document.parentOf('q')?.id).toBe('p');
    expect(document.parentOf('q-core')?.id).toBe('q');
    const saved = writer.serialize(document);
    expect(saved).toContain('x="1" y="2" width="3" height="4"');
    expect(writer.serialize(reader.read(saved).document)).toBe(saved);
  });

  it('does not fabricate missing SVG parts from the CLI creation template', async () => {
    const { reader } = await readerAndWriter();
    expect(() => reader.read('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><g id="p" data-kind="guarded"/></svg>'))
      .toThrow('required core missing: p');
    expect(() => reader.read('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><g id="p" data-kind="guarded"><circle id="p-core" cx="0" cy="0" r="1"/></g></svg>'))
      .toThrow('required core missing: p');
  });

  it('preserves the active document, default path and history when imported composite validation fails', async () => {
    const directory = await TemporaryDirectory.create('svg-composite-import-');
    try {
      const { reader, writer } = await readerAndWriter();
      const harness = await ApplicationHarness.create(new SvgDocumentStore(reader, writer));
      await harness.plugins.activate('guarded', new RegistrationTestPlugin((context) => context.registerShape(new GuardedProvider())));
      const stable = directory.file('stable.svg').replaceAll('\\', '/');
      const invalid = directory.file('invalid.svg').replaceAll('\\', '/');
      await harness.repl.executeLine('init 100 100');
      await harness.repl.executeLine('create guarded p');
      await harness.repl.executeLine('save "' + stable + '"');
      await harness.repl.executeLine('move p 1 0');
      await harness.repl.executeLine('undo');
      const before = await harness.repl.executeLine('tree');
      await writeFile(invalid, '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><g id="bad" data-kind="guarded"/></svg>');
      expect(await harness.repl.executeLine('read "' + invalid + '"')).toBe('error: required core missing: bad');
      expect(await harness.repl.executeLine('tree')).toBe(before);
      expect(harness.history.undoCount()).toBe(0);
      expect(harness.history.redoCount()).toBe(1);
      expect(harness.history.isBlocked()).toBe(false);
      await harness.repl.executeLine('redo');
      expect(await harness.repl.executeLine('save')).toBe('saved to ' + stable + ' (2 elements)');
    } finally {
      const resolved = await realpath(directory.path);
      expect(dirname(resolved)).toBe(await realpath(tmpdir()));
      expect(basename(resolved).startsWith('svg-composite-import-')).toBe(true);
      await directory.dispose();
    }
  });
});
