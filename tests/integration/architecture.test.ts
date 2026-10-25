import { readdir, readFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const sourceRoot = fileURLToPath(new URL('../../src', import.meta.url));
const testsRoot = fileURLToPath(new URL('..', import.meta.url));

async function typescriptFiles(root: string): Promise<readonly string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await typescriptFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(path);
    }
  }
  return files;
}

describe('architecture guards', () => {
  it('[ARCH-04/07] keeps external adapters out of the domain', async () => {
    const files = await typescriptFiles(join(sourceRoot, 'domain'));
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      const imports = [
        ...source.matchAll(/from\s+['"]([^'"]+)['"]/g)
      ].map((match) => match[1]);
      expect(source).not.toMatch(
        /from\s+['"][^'"]*(?:application|cli|infrastructure|bootstrap|node:|xml)/
      );
      for (const imported of imports) {
        expect(imported?.startsWith('.')).toBe(true);
      }
    }
  });

  it('[ARCH-05] keeps one matching class per production file', async () => {
    const files = await typescriptFiles(sourceRoot);
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      const classes = [
        ...source.matchAll(
          /(?:^|\n)\s*(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z0-9_]+)/g
        )
      ].map((match) => match[1]);
      if (classes.length === 0) {
        continue;
      }
      expect(classes).toHaveLength(1);
      expect(classes[0]).toBe(basename(file, '.ts'));
    }
  });

  it('[ARCH-07] has no circular production imports', async () => {
    const files = await typescriptFiles(sourceRoot);
    const graph = new Map<string, readonly string[]>();
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      const imports = [
        ...source.matchAll(/import\s+([^'"]*?)from\s+['"](\.[^'"]+\.js)['"]/g)
      ]
        .filter((match) => !match[1]?.trimStart().startsWith('type '))
        .map((match) => match[2])
        .filter((value): value is string => value !== undefined)
        .map((value) => resolve(dirname(file), value.replace(/\.js$/, '.ts')))
        .filter((value) => files.includes(value));
      graph.set(file, imports);
    }
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (file: string): void => {
      if (visiting.has(file)) {
        throw new Error(`circular production import: ${file}`);
      }
      if (visited.has(file)) {
        return;
      }
      visiting.add(file);
      for (const dependency of graph.get(file) ?? []) {
        visit(dependency);
      }
      visiting.delete(file);
      visited.add(file);
    };

    for (const file of files) {
      visit(file);
    }
    expect(visited.size).toBe(files.length);
  });

  it('[ARCH-07] enforces the documented layer directions', async () => {
    const files = await typescriptFiles(sourceRoot);
    const allowedImports = new Map<string, ReadonlySet<string>>([
      ['domain', new Set(['domain'])],
      ['application', new Set(['application', 'domain'])],
      ['cli', new Set(['cli', 'application'])],
      ['infrastructure', new Set(['infrastructure', 'application', 'domain'])],
      [
        'bootstrap',
        new Set(['bootstrap', 'cli', 'application', 'infrastructure', 'domain'])
      ]
    ]);

    for (const file of files) {
      const sourceLayer = file
        .slice(sourceRoot.length + 1)
        .split(/[\\/]/)[0];
      const allowed = allowedImports.get(sourceLayer ?? '');
      expect(allowed).toBeDefined();

      const source = await readFile(file, 'utf8');
      const relativeImports = [
        ...source.matchAll(/from\s+['"](\.[^'"]+\.js)['"]/g)
      ]
        .map((match) => match[1])
        .filter((value): value is string => value !== undefined);
      for (const imported of relativeImports) {
        const target = resolve(
          dirname(file),
          imported.replace(/\.js$/, '.ts')
        );
        const targetLayer = target
          .slice(sourceRoot.length + 1)
          .split(/[\\/]/)[0];
        expect(allowed?.has(targetLayer ?? '')).toBe(true);
      }
    }
  });

  it('[ARCH-06/08/09/10] keeps dispatch, command and bootstrap boundaries', async () => {
    const sourceFiles = await typescriptFiles(sourceRoot);
    const commandFiles = await typescriptFiles(join(sourceRoot, 'application/commands'));
    const nonBootstrapFiles = sourceFiles.filter(
      (file) => !file.includes(`${join(sourceRoot, 'bootstrap')}`)
    );
    expect(
      sourceFiles.some((file) => basename(file) === 'ShapeTreeMutation.ts')
    ).toBe(false);

    for (const file of sourceFiles) {
      const source = await readFile(file, 'utf8');
      if (source.includes('switch (spec.type)')) {
        expect(basename(file)).toBe('ShapeFactory.ts');
      }
      expect(source).not.toMatch(/switch\s*\(\s*(?:tag|name|type)\s*\)/);
      expect(source).not.toMatch(/\b(?:EditorApi|ShapeProvider|class\s+Box)\b/);
    }
    for (const file of commandFiles) {
      const source = await readFile(file, 'utf8');
      expect(source).not.toMatch(
        /ShapeTree\b|ShapeStructurePlanner|node:fs|fast-xml|SvgDocumentStore|SvgWriteVisitor/
      );
      expect(source).not.toMatch(
        /this\.document\.(?:createShape|deleteShape)\(|\.(?:move|scale|set)\(/
      );
    }
    for (const file of nonBootstrapFiles) {
      const source = await readFile(file, 'utf8');
      expect(source).not.toMatch(/from\s+['"][^'"]*bootstrap/);
    }

    const dispatcherSource = await readFile(
      join(sourceRoot, 'application/CommandDispatcher.ts'),
      'utf8'
    );
    expect(dispatcherSource).not.toMatch(
      /history\s*=\s*new CommandHistory/
    );


    const createCommandSource = await readFile(
      join(sourceRoot, 'application/commands/CreateShapeCommand.ts'),
      'utf8'
    );
    expect(createCommandSource).toMatch(
      /class CreateShapeCommand extends EditChangeSetCommand/
    );

    const attributeUpdateSource = await readFile(
      join(sourceRoot, 'domain/shapes/ShapeAttributeUpdate.ts'),
      'utf8'
    );
    expect(attributeUpdateSource).toMatch(
      /valueKind: ShapeAttributeValueKind/
    );
  });

  it('[ARCH-11] contains no skipped or placeholder tests', async () => {
    const testFiles = (await typescriptFiles(testsRoot)).filter((file) =>
      file.endsWith('.test.ts')
    );
    for (const file of testFiles) {
      const source = await readFile(file, 'utf8');
      expect(source).not.toMatch(/\b(?:describe|it)\.(?:skip|todo)\b/);
      expect(source).not.toMatch(/\bTO[D]O\b|\bFIXME\b/);
    }
  });
});
