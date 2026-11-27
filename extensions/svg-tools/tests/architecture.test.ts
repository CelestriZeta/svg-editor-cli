import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const files = async (directory: string): Promise<string[]> => {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    result.push(...(entry.isDirectory() ? await files(path) : [path]));
  }
  return result.filter(path => path.endsWith('.ts'));
};

describe('extension architecture boundaries', () => {
  it('keeps one matching class per file and avoids CLI coupling or tag dispatch', async () => {
    for (const file of await files(root)) {
      const source = await readFile(file, 'utf8');
      const classes = [...source.matchAll(/export class (\w+)/g)].map(match => match[1]);
      expect(classes.length).toBeLessThanOrEqual(1);
      if (classes.length) { expect(classes[0]).toBe(basename(file, '.ts')); }
      expect(source).not.toMatch(/from ['"][^'"]*(?:domain|application|infrastructure|bootstrap|node:fs)/);
      expect(source).not.toMatch(/switch\s*\(/);
    }
  });

  it('keeps the source syntax model independent from VSCode and XML', async () => {
    const source = await readFile(join(root, 'outline/SvgOutlineElement.ts'), 'utf8');
    expect(source).not.toMatch(/from ['"](?:vscode|saxes)/);
    const parser = await readFile(join(root, 'outline/SvgOutlineParser.ts'), 'utf8');
    expect(parser).not.toMatch(/from ['"]vscode/);
  });
});
