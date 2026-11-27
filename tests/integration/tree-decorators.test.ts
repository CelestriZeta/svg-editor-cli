import { describe, expect, it } from 'vitest';
import { TreeFormatter } from '../../src/cli/TreeFormatter.js';
import { ShapeFormatter } from '../../src/cli/ShapeFormatter.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { DocumentViewVisitor } from '../../src/application/queries/DocumentViewVisitor.js';
import { TestShapeCatalog } from '../support/TestShapeCatalog.js';
import { PluginRegistry } from '../../src/application/extensions/PluginRegistry.js';
import { RegistrationTestPlugin } from '../support/RegistrationTestPlugin.js';
import { DocumentCheckpoints } from '../../src/application/DocumentCheckpoints.js';

describe('tree decorator plumbing', () => {
  it('keeps baseline empty and appends independent labels in registration order', async () => {
    const doc = new SvgDocument(10, 20); doc.createShape(new RectSpec('r', 0, 0, 1, 1));
    const view = new DocumentViewVisitor(new TestShapeCatalog()).visit(doc);
    const plugins = new PluginRegistry();
    const formatter = new TreeFormatter(new ShapeFormatter(), plugins, () => view);
    const before = formatter.format(view);
    expect(before).toBe(new TreeFormatter().format(view));
    for (const name of ['one', 'two']) await plugins.activate(name, new RegistrationTestPlugin(c =>
      c.registerDecorator({ name, labels: ctx => [ctx.shape === undefined ? name : name + '-shape'] })));
    expect(formatter.format(view).split('\n')[0]).toBe('svg (10x20) one two');
    expect(formatter.formatSubtree(view.children[0]!)).toContain('one-shape two-shape');
  });
  it('rejects multiline labels instead of injecting tree lines', async () => {
    const plugins = new PluginRegistry();
    await plugins.activate('bad', new RegistrationTestPlugin(c => c.registerDecorator({ name: 'bad', labels: () => ['x\ny'] })));
    expect(() => new TreeFormatter(new ShapeFormatter(), plugins).format(new DocumentViewVisitor(new TestShapeCatalog()).visit(new SvgDocument(1,1)))).toThrow('invalid tree labels');
  });
  it('isolates checkpoint observer faults and supports unsubscribe', () => {
    const events = new DocumentCheckpoints(new DocumentViewVisitor(new TestShapeCatalog()));
    let count = 0;
    events.subscribe(() => { throw new Error('observer'); });
    const stop = events.subscribe(() => { count++; });
    events.capture(new SvgDocument(1,1)); stop(); events.capture(new SvgDocument(2,2));
    expect(count).toBe(1);
  });
});
