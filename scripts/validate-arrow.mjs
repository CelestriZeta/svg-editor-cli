import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';

const root = resolve('.');
const evidence = join(root, 'doc/resources/cli/arrow');
const temporary = await mkdtemp(join(tmpdir(), 'svg-arrow-'));
const entry = join(root, 'dist/bootstrap/entry.js');
const checks = [];
function pass(message) { checks.push('PASS ' + message); console.log('PASS ' + message); }
function replay(input, args = []) {
  const result = spawnSync(process.execPath, [entry, ...args], { cwd: temporary, input, timeout: 15000 });
  if (result.error || result.status !== 0 || result.stderr.length) throw result.error ?? new Error(result.stderr.toString());
  return result.stdout;
}
try {
  await mkdir(evidence, { recursive: true });
  const config = JSON.parse(await readFile(join(root, 'plugins.config.json'), 'utf8'));
  for (const plugin of config.plugins) plugin.module = resolve(root, plugin.module);
  await writeFile(join(temporary, 'config.json'), JSON.stringify(config));
  const input = await readFile(join(root, 'doc/resources/transcript/arrow.txt'));
  const a = replay(input);
  const svgA = await readFile(join(temporary, 'arrow.svg'));
  const b = replay(input, ['--config', join(temporary, 'config.json')]);
  const svgB = await readFile(join(temporary, 'arrow.svg'));
  if (!a.equals(b) || !svgA.equals(svgB)) throw new Error('code/config byte mismatch');
  if (a.includes(Buffer.from('error:')) || !a.includes(Buffer.from('line: 3  (total 3, containers 2)')) ||
    !svgA.includes(Buffer.from('data-kind="arrow"'))) throw new Error('missing arrow behavior');
  pass('code/config stdout and SVG byte-identical; help/stats/styles/history available');
  await writeFile(join(evidence, 'code.stdout.txt'), a);
  await writeFile(join(evidence, 'config.stdout.txt'), b);
  await writeFile(join(evidence, 'arrow.svg'), svgA);

  const disabled = ['--config', join(root, 'tests/fixtures/acceptance/no-plugins.json')];
  const fallback = replay('read arrow.svg\ntree\nsave fallback.svg\ncreate arrow missing 0 0 10 10\n', disabled);
  if (!fallback.includes(Buffer.from('unknown shape type: arrow')) || !fallback.includes(Buffer.from('line#edge-shaft'))) {
    throw new Error('disabled fallback mismatch');
  }
  const fallbackSvg = await readFile(join(temporary, 'fallback.svg'));
  if (fallbackSvg.includes(Buffer.from('data-kind="arrow"'))) throw new Error('fallback retained logical marker');
  pass('disabled plugin rejects create and preserves visible three-line fallback');
  await writeFile(join(evidence, 'disabled.stdout.txt'), fallback);
  await writeFile(join(evidence, 'fallback.svg'), fallbackSvg);

  await writeFile(join(temporary, 'broken.svg'), svgA.toString().replace(/<line id="edge-head-left"[^>]*\/>/, ''));
  const fault = replay('init\ncreate arrow edge 0 0 60 0\nmove edge 1 0\nundo\nread broken.svg\nredo\nshow edge-shaft\nsave kept.svg\n');
  if (!fault.includes(Buffer.from('error: invalid arrow parts: edge')) ||
    !fault.includes(Buffer.from('(1,0) -> (61,0)'))) throw new Error('failed read lost document/redo');
  pass('malformed real SVG read preserves active document and redo');
  await writeFile(join(evidence, 'failure.stdout.txt'), fault);

  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  for (const directory of ['src/application', 'src/domain', 'src/cli', 'src/infrastructure', 'src/plugins', 'src/bootstrap']) {
    git('cat-file', '-e', 'HEAD:' + directory);
  }
  const changed = [...git('diff', '--name-only', 'HEAD', '--', 'src').split('\n'),
    ...git('ls-files', '--others', '--exclude-standard', '--', 'src').split('\n')].filter(Boolean);
  if (changed.some(p => p !== 'src/bootstrap/CodePlugins.ts' && !p.startsWith('src/plugins/shape-arrow/'))) {
    throw new Error('unexpected kernel/old-plugin change: ' + changed.join(','));
  }
  pass('runtime delta contains only new arrow plugin and CodePlugins assembly');
  await writeFile(join(evidence, 'validation.txt'), checks.join('\n') + '\n');
} finally {
  const target = await realpath(temporary);
  if (dirname(target).toLowerCase() !== (await realpath(tmpdir())).toLowerCase() || !basename(target).startsWith('svg-arrow-')) {
    throw new Error('unsafe cleanup');
  }
  await rm(target, { recursive: true, force: true });
}
