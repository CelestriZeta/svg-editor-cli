import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

await build({
  absWorkingDir: fileURLToPath(new URL('..', import.meta.url)),
  entryPoints: ['extensions/svg-tools/src/extension.ts'],
  outfile: 'extensions/svg-tools/dist/extension.cjs',
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['vscode'],
  sourcemap: true
});

if (process.argv.includes('--tests')) {
  await build({
    absWorkingDir: fileURLToPath(new URL('..', import.meta.url)),
    entryPoints: ['extensions/svg-tools/tests/host/index.ts'],
    outfile: 'extensions/svg-tools/dist/host-tests.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    external: ['vscode']
  });
}
