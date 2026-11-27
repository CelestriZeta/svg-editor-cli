import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile, rm, readdir, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';

const root = resolve('.');
const evidence = resolve('doc/resources/cli/phase2');
const entry = join(root, 'dist/bootstrap/entry.js');
const temporary = await mkdtemp(join(tmpdir(), 'svg-phase2-'));
const work = join(temporary, 'work');
const results = [];
const git = (...args) => execFileSync('git', args, { cwd: root });
const pass = text => { results.push('PASS ' + text); console.log('PASS ' + text); };
function equal(actual, expected, label) {
  if (!actual.equals(expected)) throw new Error('byte mismatch: ' + label);
  pass(label);
}
async function seed() {
  for (const name of ['demo.svg', 'flowchart.svg', 'flowchart-box.svg', 'plugins.svg']) {
    await writeFile(join(work, name), '<!-- output placeholder -->\n');
  }
  await writeFile(join(work, 'other.svg'), git('show', 'final:tests/fixtures/acceptance/other.svg'));
}
function replay(input, args) {
  const result = spawnSync(process.execPath, [entry, ...args], { cwd: work, input, timeout: 15000 });
  if (result.error || result.status !== 0 || result.stderr.length) throw result.error ?? new Error(result.stderr.toString());
  return result.stdout;
}
try {
  await mkdir(evidence, { recursive: true });
  await mkdir(work);
  await mkdir(join(work, 'docs'));
  await writeFile(join(work, '.hidden'), 'fixed\n');
  const empty = join(temporary, 'empty.json');
  const config = join(temporary, 'plugins.json');
  await writeFile(empty, '{"plugins":[]}\n');
  const configured = JSON.parse(await readFile(join(root, 'plugins.config.json'), 'utf8'));
  for (const plugin of configured.plugins) plugin.module = resolve(root, plugin.module);
  await writeFile(config, JSON.stringify(configured));

  const disabled = replay(Buffer.from('stats\ndir\ninit\ncreate box n 0 0 1 1 "x"\n'), ['--config', empty]).toString('utf8');
  if (!disabled.includes('error: unknown command: stats\n') || !disabled.includes('error: unknown command: dir\n') || !disabled.includes('error: unknown shape type: box')) throw new Error('disabled plugin leaked');
  pass('disabled optional commands and box use baseline fallbacks');
  const fixtures = ['typical.txt', 'flowchart.txt', 'other.svg', 'demo.svg', 'flowchart.svg',
    'typical.expected.txt', 'flowchart.expected.txt'];
  for (const name of fixtures) equal(await readFile(join(root, 'tests/fixtures/acceptance', name)),
    git('show', 'final:tests/fixtures/acceptance/' + name), 'unchanged final fixture ' + name);
  for (const session of ['typical', 'flowchart']) {
    await seed();
    const input = git('show', 'final:tests/fixtures/acceptance/' + session + '.txt');
    const output = replay(input, ['--config', empty]);
    equal(output, git('show', 'final:tests/fixtures/acceptance/' + session + '.expected.txt'), 'disabled plugins final stdout ' + session);
    const saved = session === 'typical' ? 'demo.svg' : 'flowchart.svg';
    equal(await readFile(join(work, saved)), git('show', 'final:tests/fixtures/acceptance/' + saved), 'disabled plugins final SVG ' + session);
    await writeFile(join(evidence, 'baseline-' + session + '.stdout.txt'), output);
  }
  for (const session of ['typical', 'flowchart', 'box', 'plugins']) {
    const input = await readFile(join(root, session === 'typical' || session === 'flowchart'
      ? 'tests/fixtures/acceptance/' + session + '.txt' : 'doc/resources/transcript/' + session + '.txt'));
    await seed();
    const fixedNames = await readdir(work);
    const a = replay(input, []);
    const saved = { typical: 'demo.svg', flowchart: 'flowchart.svg', box: 'flowchart-box.svg', plugins: 'plugins.svg' }[session];
    const svgA = await readFile(join(work, saved));
    await seed();
    const b = replay(input, ['--config', config]);
    equal(a, b, 'code/config stdout ' + session);
    equal(svgA, await readFile(join(work, saved)), 'code/config SVG ' + session);
    equal(Buffer.from(JSON.stringify(await readdir(work))), Buffer.from(JSON.stringify(fixedNames)), 'fixed working directory ' + session);
    if (['box', 'plugins'].includes(session) && a.includes(Buffer.from('error:'))) throw new Error('unexpected plugin error: ' + session);
    if (session === 'plugins') {
      const output = a.toString('utf8');
      if (!output.includes('rect: 1  text: 1  circle: 1  (total 3, containers 1)') ||
        !output.includes('(box) *') || !output.includes('[DIR]  docs') || !output.includes('[FILE]  .hidden')) throw new Error('missing plugin behavior');
      pass('stats, dir, hidden files and simultaneous box/star labels');
    }
    await writeFile(join(evidence, session + '.code.stdout.txt'), a);
    await writeFile(join(evidence, session + '.config.stdout.txt'), b);
    await writeFile(join(evidence, saved), svgA);
  }
  const log = git('log', '--format=%H%x09%s').toString('utf8').trim().split('\n');
  const commits = [
    ['统计', 'feat(stats):', 'src/plugins/stats/', true],
    ['目录', 'feat(dir):', 'src/plugins/dir/', false],
    ['box A', 'feat(box): 以代码', 'src/plugins/shape-box/', true],
    ['box B', 'feat(box): 通过配置', undefined, false],
    ['标签', 'feat(tree): 添加保存点内容比较标签', 'src/plugins/modified-star/', true]
  ];
  for (const [label, prefix, added, allowAssembly] of commits) {
    const line = log.find(l => l.split('\t')[1]?.startsWith(prefix));
    if (!line) throw new Error('missing commit: ' + prefix);
    const sha = line.split('\t')[0];
    for (const path of ['src/application', 'src/domain', 'src/cli', 'src/infrastructure', 'src/bootstrap', 'src/plugins']) git('cat-file', '-e', sha + ':' + path);
    const changed = git('diff', '--name-only', sha + '^', sha, '--', 'src').toString('utf8').trim().split('\n').filter(Boolean);
    if (changed.some(p => !(added && p.startsWith(added)) && !(allowAssembly && p === 'src/bootstrap/CodePlugins.ts'))) {
      throw new Error('unexpected runtime edit in ' + label + ': ' + changed.join(','));
    }
    pass(label + ' zero kernel/existing-plugin diff ' + sha.slice(0, 7));
  }
  await writeFile(join(evidence, 'validation.txt'), results.join('\n') + '\n');
} finally {
  const target = await realpath(temporary);
  if (dirname(target).toLowerCase() !== (await realpath(tmpdir())).toLowerCase() || !basename(target).startsWith('svg-phase2-')) throw new Error('unsafe cleanup');
  await rm(target, { recursive: true, force: true });
}
