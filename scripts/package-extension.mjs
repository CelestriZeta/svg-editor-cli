import { createVSIX } from '@vscode/vsce';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const directory = fileURLToPath(new URL('../extensions/svg-tools', import.meta.url));
const manifest = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
await createVSIX({
  cwd: directory,
  packagePath: join(directory, 'dist', `${manifest.name}-${manifest.version}.vsix`),
  dependencies: false,
  skipLicense: true,
  allowMissingRepository: true
});
