import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTests } from '@vscode/test-electron';

const root = fileURLToPath(new URL('..', import.meta.url));
const profile = await mkdtemp(join(tmpdir(), 'svg-tools-host-'));
const report = join(root, 'doc/resources/vscode');
await mkdir(report, { recursive: true });
const reportPath = join(report, 'host-results.json');
await writeFile(reportPath, JSON.stringify({ passed: false, status: 'running' }, null, 2) + '\n');
try {
  await runTests({
    ...(process.env.VSCODE_EXECUTABLE_PATH ? { vscodeExecutablePath: process.env.VSCODE_EXECUTABLE_PATH } : {}),
    extensionDevelopmentPath: join(root, 'extensions/svg-tools'),
    extensionTestsPath: join(root, 'extensions/svg-tools/dist/host-tests.cjs'),
    extensionTestsEnv: { SVG_TOOLS_TEST_REPORT: report },
    launchArgs: [join(root, 'extensions/svg-tools/examples'), '--disable-extensions',
      '--user-data-dir', join(profile, 'user'), '--extensions-dir', join(profile, 'extensions'),
      '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust']
  });
} catch (error) {
  await writeFile(reportPath, JSON.stringify({ passed: false, error: String(error) }, null, 2) + '\n');
  throw error;
} finally {
  if (resolve(dirname(profile)) !== resolve(tmpdir()) || !basename(profile).startsWith('svg-tools-host-')) {
    throw new Error('Refusing to remove a directory outside the test profile');
  }
  await rm(profile, { recursive: true, force: true });
}
