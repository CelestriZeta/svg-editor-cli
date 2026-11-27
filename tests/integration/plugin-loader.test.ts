import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { PluginLoader } from '../../src/bootstrap/PluginLoader.js';
import { PluginRegistry } from '../../src/application/extensions/PluginRegistry.js';
import { PluginManifest } from '../../src/application/extensions/PluginManifest.js';
import type { PluginServices } from '../../src/application/extensions/PluginServices.js';

const roots: string[] = [];
afterEach(async () => { for (const root of roots.splice(0)) {
  if (dirname(root) !== tmpdir() || !basename(root).startsWith('svg-loader-')) throw new Error('unsafe cleanup');
  await rm(root, { recursive: true, force: true });
} });
async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'svg-loader-')); roots.push(root);
  const registry = new PluginRegistry(); const errors: string[] = [];
  const loader = new PluginLoader(registry, {} as PluginServices, s => errors.push(s));
  async function fixture(name: string, body: string, decorators: string[] = []) {
    await mkdir(join(root, name));
    await writeFile(join(root, name, 'package.json'), JSON.stringify({ name, type: 'module', main: 'index.js', contributes: { decorators } }));
    await writeFile(join(root, name, 'index.js'), body);
  }
  return { root, registry, errors, loader, fixture };
}
const registration = (name: string) => "c.registerDecorator({name:'" + name + "',labels:()=>[]});";
describe('configuration and code plugin assembly', () => {
  it('contains four failures, duplicate and partial activation rollback and continues', async () => {
    const h = await setup();
    await h.fixture('noexport', 'export const x=1;');
    await h.fixture('mismatch', 'export default class {activate(c){' + registration('leaked') + '}}');
    await h.fixture('throws', 'export default class {activate(c){' + registration('staged') + 'throw Error("boom")}}', ['staged']);
    await h.fixture('good', 'export default class {activate(c){' + registration('ok') + '}}', ['ok']);
    await h.fixture('duplicate', 'export default class {activate(c){' + registration('ok') + '}}', ['ok']);
    await h.fixture('dependency', 'import "./missing-dependency.js"; export default class {}');
    await h.fixture('disabled', 'throw Error("must not evaluate")');
    await writeFile(join(h.root, 'config.json'), JSON.stringify({ plugins: ['absent','noexport','mismatch','throws','good','duplicate','dependency'].map(n=>({module:'./'+n})).concat([{module:'./disabled',enabled:false}] as never[]) }));
    await h.loader.config(join(h.root, 'config.json'));
    expect(h.errors).toHaveLength(6);
    expect(h.errors[0]).toBe('error: plugin not found: ./absent');
    expect(h.errors[1]).toBe('error: plugin has no default export: ./noexport');
    expect(h.errors[2]).toMatch(/^error: plugin manifest mismatch: mismatch/);
    expect(h.errors[3]).toBe('error: plugin failed to activate: throws (boom)');
    expect(h.errors[4]).toBe('error: duplicate registration: decorators/ok');
    expect(h.errors[5]).toMatch(/^error: plugin failed to activate: dependency/);
    expect(h.registry.decorators.values().map(d=>d.name)).toEqual(['ok']);
  });
  it('uses the same manifest validation for code assembly and passes config options', async () => {
    const h = await setup();
    await h.loader.code(new PluginManifest('code', {decorators:['code']}), {activate(c){ c.registerDecorator({name:'code',labels:()=>[]}); }});
    await h.fixture('options', 'export default class {constructor(s,o){this.o=o} activate(c){c.registerDecorator({name:this.o.name,labels:()=>[]})}}', ['configured']);
    await writeFile(join(h.root,'config.json'), JSON.stringify({plugins:[{module:'./options',options:{name:'configured'}}]}));
    await h.loader.config(join(h.root,'config.json'));
    expect(h.errors).toEqual([]);
    expect(h.registry.decorators.values().map(d=>d.name)).toEqual(['code','configured']);
  });
  it.each(['{','{}','{"plugins":[{"module":"x","enabled":1}]}'])('rejects invalid config %s before loading entries', async content => {
    const h=await setup(); await writeFile(join(h.root,'bad.json'),content);
    await h.loader.config(join(h.root,'bad.json'));
    expect(h.errors).toEqual(['error: invalid plugin config']);
    expect(h.registry.decorators.values()).toEqual([]);
  });
});
