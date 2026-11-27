import { readdir, readFile, writeFile } from 'node:fs/promises';
for (const entry of await readdir('src/plugins', { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const metadata = JSON.parse(await readFile('src/plugins/' + entry.name + '/package.json', 'utf8'));
  await writeFile('dist/plugins/' + entry.name + '/package.json', JSON.stringify(metadata, null, 2) + '\n');
}
