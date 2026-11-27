import { describe, expect, it } from 'vitest';

import { PluginRegistry } from '../../src/application/extensions/PluginRegistry.js';
import type { PluginContext } from '../../src/application/extensions/PluginContext.js';
import { TreeLineContext } from '../../src/application/extensions/TreeLineContext.js';
import { DocumentViewVisitor } from '../../src/application/queries/DocumentViewVisitor.js';
import { HelpResult } from '../../src/application/commands/results/HelpResult.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { RegistrationTestPlugin } from '../support/RegistrationTestPlugin.js';
import { RegistrationTestCommand } from '../support/RegistrationTestCommand.js';
import { RegistrationTestShape } from '../support/RegistrationTestShape.js';
import { RegistrationTestDecorator } from '../support/RegistrationTestDecorator.js';
import { RegistrationTestAttribute } from '../support/RegistrationTestAttribute.js';

function registerAll(context: PluginContext): void {
  context.registerShape(new RegistrationTestShape());
  context.registerCommand(new RegistrationTestCommand());
  context.registerDecorator(new RegistrationTestDecorator());
  context.registerAttribute(new RegistrationTestAttribute());
}

function names(registry: PluginRegistry): readonly (readonly string[])[] {
  return [registry.shapes, registry.commands, registry.decorators, registry.attributes]
    .map((entries) => entries.values().map((entry) => entry.name));
}

describe('plugin registration transactions', () => {
  it('starts empty with no registrations or implicit optional plugins', () => {
    const registry = new PluginRegistry();
    expect(names(registry)).toEqual([[], [], [], []]);
    expect(registry.commands.get('stats')).toBeUndefined();
    expect(registry.shapes.get('box')).toBeUndefined();
  });

  it('publishes all four class contributions together and permits their contract calls', async () => {
    const registry = new PluginRegistry();
    await registry.activate('probe', new RegistrationTestPlugin((context) => {
      registerAll(context);
      expect(names(registry)).toEqual([[], [], [], []]);
      expect(Object.keys(context).sort()).toEqual([
        'registerAttribute', 'registerCommand', 'registerDecorator', 'registerShape'
      ]);
      expect(Object.isFrozen(context)).toBe(true);
    }));

    expect(names(registry)).toEqual([['rect'], ['probe'], ['probe-label'], ['probe-fill']]);
    const command = registry.commands.get('probe');
    expect(command?.syntaxes).toEqual(['probe']);
    const result = await command?.create(['argument']).execute();
    expect(result).toBeInstanceOf(HelpResult);
    expect(result).toMatchObject({ syntaxes: ['argument'] });

    const spec = registry.shapes.get('rect')?.createSpec('r1', ['0', '0', '2', '3']);
    expect(spec).toBeDefined();
    if (spec === undefined) throw new Error('missing registered shape');
    const document = new SvgDocument(100, 100);
    const shape = document.createShape(spec);
    const visitor = new DocumentViewVisitor();
    const view = visitor.visit(document);
    const snapshot = visitor.inspect(shape);
    const decorator = registry.decorators.get('probe-label');
    expect(decorator?.labels(new TreeLineContext(view))).toEqual(['(canvas)']);
    expect(decorator?.labels(new TreeLineContext(view, snapshot))).toEqual(['(shape)']);

    const handler = registry.attributes.get('probe-fill');
    expect(handler?.handles(snapshot, 'fill')).toBe(true);
    expect(handler?.handles(snapshot, 'label')).toBe(false);
    const edit = handler?.prepare(snapshot, 'fill', 'red', {
      prepareSet: (id, update) => document.requireShape(id).prepareSet(update),
      readAttribute: (id, attribute) => document.requireShape(id).attributeValue(attribute)
    });
    expect(shape.fill).toBeUndefined();
    expect(edit).toBeDefined();
    edit?.changeSet.apply();
    expect(edit?.readValue().textValue).toBe('red');
    edit?.changeSet.revert();
    expect(edit?.readValue().isAbsent).toBe(true);
  });

  it.each(['shapes', 'commands', 'decorators', 'attributes'] as const)(
    'rejects a duplicate in %s and discards every contribution of the failed plugin',
    async (category) => {
      const registry = new PluginRegistry();
      await registry.activate('original', new RegistrationTestPlugin(registerAll));
      const before = names(registry);
      const registrations = {
        shapes: (context: PluginContext) => context.registerShape(new RegistrationTestShape()),
        commands: (context: PluginContext) => context.registerCommand(new RegistrationTestCommand()),
        decorators: (context: PluginContext) => context.registerDecorator(new RegistrationTestDecorator()),
        attributes: (context: PluginContext) => context.registerAttribute(new RegistrationTestAttribute())
      };
      const duplicateName = before[['shapes', 'commands', 'decorators', 'attributes'].indexOf(category)]?.[0];
      await expect(registry.activate('duplicate', new RegistrationTestPlugin((context) => {
        context.registerCommand(new RegistrationTestCommand('discarded'));
        registrations[category](context);
      }))).rejects.toThrow(`duplicate registration: ${category}/${duplicateName}`);
      expect(names(registry)).toEqual(before);
      expect(registry.commands.get('discarded')).toBeUndefined();
    }
  );

  it('rejects duplicate names within one activation even when the plugin catches the error', async () => {
    const registry = new PluginRegistry();
    await expect(registry.activate('caught', new RegistrationTestPlugin((context) => {
      context.registerCommand(new RegistrationTestCommand());
      expect(() => context.registerCommand(new RegistrationTestCommand()))
        .toThrow('duplicate registration: commands/probe');
      context.registerDecorator(new RegistrationTestDecorator());
    }))).rejects.toThrow('duplicate registration: commands/probe');
    expect(names(registry)).toEqual([[], [], [], []]);
  });

  it('discards partial registrations on a synchronous throw and keeps the original cause', async () => {
    const registry = new PluginRegistry();
    const cause = new Error('activation exploded');
    await expect(registry.activate('broken', new RegistrationTestPlugin((context) => {
      registerAll(context);
      throw cause;
    }))).rejects.toMatchObject({
      message: 'plugin failed to activate: broken (activation exploded)', cause
    });
    expect(names(registry)).toEqual([[], [], [], []]);
    await registry.activate('next', new RegistrationTestPlugin(registerAll));
    expect(registry.commands.get('probe')).toBeDefined();
  });

  it('keeps registrations private across await and rolls back an asynchronous rejection', async () => {
    const registry = new PluginRegistry();
    let release: () => void = () => { throw new Error('activation not entered'); };
    const gate = new Promise<void>((resolve) => { release = resolve; });
    let entered: () => void = () => { throw new Error('missing entry signal'); };
    const started = new Promise<void>((resolve) => { entered = resolve; });
    const activation = registry.activate('async', new RegistrationTestPlugin(async (context) => {
      registerAll(context);
      entered();
      await gate;
      throw new Error('rejected');
    }));
    const assertion = expect(activation).rejects.toThrow('plugin failed to activate: async (rejected)');
    await started;
    expect(names(registry)).toEqual([[], [], [], []]);
    release();
    await assertion;
    expect(names(registry)).toEqual([[], [], [], []]);
  });

  it('closes retained contexts after success and failure without touching committed registrations', async () => {
    const registry = new PluginRegistry();
    const contexts: PluginContext[] = [];
    await registry.activate('success', new RegistrationTestPlugin((context) => {
      contexts.push(context);
      registerAll(context);
    }));
    await expect(registry.activate('failure', new RegistrationTestPlugin((context) => {
      contexts.push(context);
      throw new Error('failed');
    }))).rejects.toThrow('plugin failed to activate');
    const before = names(registry);
    for (const context of contexts) {
      expect(() => context.registerCommand(new RegistrationTestCommand('late')))
        .toThrow('plugin registration context is closed');
    }
    expect(names(registry)).toEqual(before);
  });

  it('serializes overlapping activations and continues the queue after a conflict', async () => {
    const registry = new PluginRegistry();
    let release: () => void = () => { throw new Error('missing release'); };
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const first = registry.activate('first', new RegistrationTestPlugin(async (context) => {
      context.registerCommand(new RegistrationTestCommand());
      await gate;
    }));
    const second = registry.activate('second', new RegistrationTestPlugin((context) => {
      context.registerCommand(new RegistrationTestCommand());
    }));
    const secondAssertion = expect(second).rejects.toThrow('duplicate registration: commands/probe');
    const third = registry.activate('third', new RegistrationTestPlugin((context) => {
      context.registerCommand(new RegistrationTestCommand('next'));
    }));
    release();
    await first;
    await secondAssertion;
    await third;
    expect(registry.commands.values().map((entry) => entry.name)).toEqual(['probe', 'next']);
  });

  it('exposes immutable registry snapshots and allows the same name in different categories', async () => {
    const registry = new PluginRegistry();
    const original = registry.commands;
    await registry.activate('shared-name', new RegistrationTestPlugin((context) => {
      context.registerCommand(new RegistrationTestCommand('rect'));
      context.registerShape(new RegistrationTestShape());
    }));
    expect(original.values()).toEqual([]);
    expect(Object.isFrozen(registry.commands.values())).toBe(true);
    expect(registry.commands.get('rect')).toBeInstanceOf(RegistrationTestCommand);
    expect(registry.shapes.get('rect')).toBeInstanceOf(RegistrationTestShape);
  });

  it.each(['', ' ', ' probe', 'probe\n', 'pro be', 'pro\nbe', 'pro\tbe'])(
    'rejects invalid registration name %j atomically', async (name) => {
      const registry = new PluginRegistry();
      await expect(registry.activate('invalid', new RegistrationTestPlugin((context) => {
        context.registerShape(new RegistrationTestShape());
        context.registerCommand(new RegistrationTestCommand(name));
      }))).rejects.toThrow('invalid registration name: commands');
      expect(names(registry)).toEqual([[], [], [], []]);
    }
  );

  it('rejects a malformed contribution before publishing any registrations', async () => {
    const registry = new PluginRegistry();
    const command = new RegistrationTestCommand();
    Object.defineProperty(command, 'create', { value: undefined });
    await expect(registry.activate('malformed', new RegistrationTestPlugin((context) => {
      context.registerShape(new RegistrationTestShape());
      expect(() => context.registerCommand(command))
        .toThrow('invalid registration: commands/probe (missing method: create)');
    }))).rejects.toThrow('invalid registration: commands/probe (missing method: create)');
    expect(names(registry)).toEqual([[], [], [], []]);
  });

  it('preserves previously committed object identities after a later activation throws', async () => {
    const registry = new PluginRegistry();
    await registry.activate('original', new RegistrationTestPlugin(registerAll));
    const command = registry.commands.get('probe');
    const before = names(registry);
    await expect(registry.activate('failed', new RegistrationTestPlugin((context) => {
      context.registerCommand(new RegistrationTestCommand('discarded'));
      throw 'non-error rejection';
    }))).rejects.toMatchObject({
      message: 'plugin failed to activate: failed (non-error rejection)',
      cause: 'non-error rejection'
    });
    expect(registry.commands.get('probe')).toBe(command);
    expect(names(registry)).toEqual(before);
  });
});
