import { describe, expect, it } from 'vitest';

import { PluginRegistry } from '../../src/application/extensions/PluginRegistry.js';
import { CommandDispatcher } from '../../src/application/CommandDispatcher.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { CommandExecutor } from '../../src/application/CommandExecutor.js';
import { CommandHistory } from '../../src/application/CommandHistory.js';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';
import { ProbeContribution } from '../support/ProbeContribution.js';
import { ProbePresenter } from '../support/ProbePresenter.js';
import { PresentedAttributeCommand } from '../support/PresentedAttributeCommand.js';
import { RegistrationTestPlugin } from '../support/RegistrationTestPlugin.js';

describe('registered command dispatch and presentation', () => {
  it('has no implicit command table in an unassembled dispatcher', async () => {
    const dispatcher = new CommandDispatcher(new PluginRegistry());
    expect(await dispatcher.create(['init']).execute()).toMatchObject({ text: 'unknown command: init' });
    expect(await dispatcher.create([]).execute()).toMatchObject({ text: 'missing command' });
  });

  it('discovers an activated command in both dispatch and help without a document', async () => {
    const harness = await ApplicationHarness.create(new RecordingDocumentStore());
    const before = await harness.repl.executeLine('help');
    expect(await harness.repl.executeLine('probe')).toBe('error: unknown command: probe');
    await harness.plugins.activate('probe', new RegistrationTestPlugin((context) => {
      context.registerCommand(new ProbeContribution());
    }));
    expect(await harness.repl.executeLine('help')).toBe(`${before}\n  probe`);
    expect(await harness.repl.executeLine('probe')).toBe('probe: 7');
    expect(harness.history.undoCount()).toBe(0);
    expect(harness.history.isBlocked()).toBe(false);
  });

  it('keeps failed plugin commands out of help and preserves existing redo history', async () => {
    const harness = await ApplicationHarness.create(new RecordingDocumentStore());
    await harness.repl.executeLine('init');
    await harness.repl.executeLine('create rect r1 0 0 1 1');
    await harness.repl.executeLine('undo');
    const before = await harness.repl.executeLine('help');
    await expect(harness.plugins.activate('failed', new RegistrationTestPlugin((context) => {
      context.registerCommand(new ProbeContribution());
      throw new Error('activation failed');
    }))).rejects.toThrow('plugin failed to activate');
    expect(await harness.repl.executeLine('help')).toBe(before);
    expect(await harness.repl.executeLine('probe')).toBe('error: unknown command: probe');
    expect(harness.history.redoCount()).toBe(1);
    expect(await harness.repl.executeLine('redo')).toBe('rect#r1 created');
  });

  it('does not record query plugin results or clear redo', async () => {
    const harness = await ApplicationHarness.create(new RecordingDocumentStore());
    await harness.plugins.activate('probe', new RegistrationTestPlugin((context) => {
      context.registerCommand(new ProbeContribution());
    }));
    await harness.repl.executeLine('init');
    await harness.repl.executeLine('create rect r1 0 0 1 1');
    await harness.repl.executeLine('undo');
    expect(await harness.repl.executeLine('probe')).toBe('probe: 7');
    expect(harness.history.undoCount()).toBe(0);
    expect(harness.history.redoCount()).toBe(1);
  });

  it('contains contribution factory failures and still accepts the next command', async () => {
    const harness = await ApplicationHarness.create(new RecordingDocumentStore());
    const contribution = new ProbeContribution();
    Object.defineProperty(contribution, 'create', { value: () => { throw new Error('factory failed'); } });
    await harness.plugins.activate('probe', new RegistrationTestPlugin((context) => {
      context.registerCommand(contribution);
    }));
    expect(await harness.repl.executeLine('probe')).toBe('error: command failed');
    expect(await harness.repl.executeLine('canvas')).toBe("error: no document. use 'init' or 'read' first");
    expect(await harness.repl.executeLine('init 20 30')).toBe('canvas 20x30 created');
  });

  it('rolls back an edit if its plugin presenter throws before the result is published', async () => {
    const document = new SvgDocument(100, 100);
    document.createShape(new RectSpec('r1', 0, 0, 1, 1));
    const history = new CommandHistory();
    const presenter = new ProbePresenter();
    Object.defineProperty(presenter, 'format', { value: () => { throw new Error('presentation failed'); } });
    const result = await new CommandExecutor(history).execute(new PresentedAttributeCommand(document, presenter));
    expect(result.succeeded).toBe(false);
    expect(document.requireShape('r1').fill).toBeUndefined();
    expect(history.undoCount()).toBe(0);
    expect(history.redoCount()).toBe(0);
  });

  it('rejects malformed command help metadata before committing the plugin', async () => {
    const registry = new PluginRegistry();
    const contribution = new ProbeContribution();
    Object.defineProperty(contribution, 'syntaxes', { value: ['probe\ninvalid'] });
    await expect(registry.activate('malformed', new RegistrationTestPlugin((context) => {
      context.registerCommand(contribution);
    }))).rejects.toThrow('invalid command syntax: probe');
    expect(registry.commands.values()).toEqual([]);
  });

  it.each(['undo', 'redo'] as const)('restores document and history when presentation fails during %s', async (direction) => {
    const document = new SvgDocument(100, 100);
    document.createShape(new RectSpec('r1', 0, 0, 1, 1));
    const history = new CommandHistory();
    const presenter = new ProbePresenter();
    const command = new PresentedAttributeCommand(document, presenter);
    await new CommandExecutor(history).execute(command);
    if (direction === 'redo') await history.undo();
    const before = {
      fill: document.requireShape('r1').fill,
      undo: history.undoCount(), redo: history.redoCount(), blocked: history.isBlocked()
    };
    Object.defineProperty(presenter, 'format', { value: () => { throw new Error('presentation failed'); } });
    await expect(history[direction]()).rejects.toThrow('presentation failed');
    expect(document.requireShape('r1').fill).toBe(before.fill);
    expect(history.undoCount()).toBe(before.undo);
    expect(history.redoCount()).toBe(before.redo);
    expect(history.isBlocked()).toBe(before.blocked);
  });

  it('rejects an invalid Command factory result and keeps the REPL usable', async () => {
    const harness = await ApplicationHarness.create(new RecordingDocumentStore());
    const contribution = new ProbeContribution();
    Object.defineProperty(contribution, 'create', { value: () => undefined });
    await harness.plugins.activate('probe', new RegistrationTestPlugin((context) => {
      context.registerCommand(contribution);
    }));
    expect(await harness.repl.executeLine('probe')).toBe('error: command failed');
    expect(await harness.repl.executeLine('init')).toBe('canvas 800x600 created');
  });
});
