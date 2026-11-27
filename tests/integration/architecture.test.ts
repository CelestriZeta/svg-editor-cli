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
      ['plugins', new Set(['plugins', 'application', 'domain'])],
      [
        'bootstrap',
        new Set(['bootstrap', 'cli', 'application', 'infrastructure', 'domain', 'plugins'])
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
    const commandFiles = [
      ...await typescriptFiles(join(sourceRoot, 'application/commands')),
      ...await typescriptFiles(join(sourceRoot, 'plugins/builtin-commands'))
    ];
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
      expect(source).not.toMatch(/\b(?:EditorApi|class\s+Box)\b/);
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
      join(sourceRoot, 'plugins/builtin-commands/commands/CreateShapeCommand.ts'),
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

  it('[ARCH-P2-01] keeps extension registration independent of hosts and internal tree mutation', async () => {
    const files = await typescriptFiles(join(sourceRoot, 'application/extensions'));
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      expect(source).not.toMatch(
        /from\s+['"][^'"]*(?:bootstrap|infrastructure|plugins|node:|saxes|domain\/document)/
      );
      expect(source).not.toMatch(/ShapeTree\b|ShapeStructurePlanner\b/);
      expect(source).not.toMatch(/console\.|process\.|\bimport\s*\(/);
    }
    const context = await readFile(
      join(sourceRoot, 'application/extensions/PluginContext.ts'), 'utf8'
    );
    expect(context).not.toMatch(/EditorSession|CommandHistory|SvgDocument|commit\(|finish\(/);
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

  it('[ARCH-P2-02] limits plugins to their own package and the public kernel API', async () => {
    const pluginRoot = join(sourceRoot, 'plugins');
    const files = await typescriptFiles(pluginRoot);
    const publicApplicationPaths = [
      'commands/contracts/', 'commands/results/', 'commands/support/',
      'commands/EditChangeSetCommand.ts', 'commands/InvalidCommand.ts',
      'extensions/Plugin.ts', 'extensions/PluginContext.ts',
      'extensions/CommandContribution.ts', 'extensions/CommandCatalog.ts',
      'extensions/ShapeCatalog.ts', 'extensions/ShapeProvider.ts',
      'ports/ActiveDocument.ts', 'ports/DocumentOperations.ts',
      'ports/LoadedDocument.ts', 'queries/DocumentQuery.ts',
      'ports/SvgContentKind.ts', 'ports/SvgShapeInput.ts', 'ports/SvgShapeOutput.ts',
      'queries/GeometrySnapshot.ts', 'queries/ShapeAnchor.ts'
    ];
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      const packageName = file.slice(pluginRoot.length + 1).split(/[\\/]/)[0];
      for (const match of source.matchAll(/from\s+['"](\.[^'"]+\.js)['"]/g)) {
        const target = resolve(dirname(file), (match[1] ?? '').replace(/\.js$/, '.ts'));
        const relative = target.slice(sourceRoot.length + 1).replaceAll('\\', '/');
        if (relative.startsWith('plugins/')) {
          expect(relative.startsWith(`plugins/${packageName}/`)).toBe(true);
        } else if (relative.startsWith('application/')) {
          const applicationPath = relative.slice('application/'.length);
          expect(publicApplicationPaths.some((allowed) =>
            allowed.endsWith('/') ? applicationPath.startsWith(allowed) : applicationPath === allowed
          )).toBe(true);
        } else {
          expect(relative.startsWith('domain/')).toBe(true);
          expect(relative).not.toMatch(/domain\/(?:document\/(?:ShapeTree|ShapeStructurePlanner|ShapeStructureCandidate|ShapeStructureChangeSet|ShapeSubtree|ShapeRelationsBinding)|ShapeFactory)\.ts/);
        }
      }
    }
    const dispatcher = await readFile(join(sourceRoot, 'application/CommandDispatcher.ts'), 'utf8');
    expect(dispatcher).not.toMatch(/Builtin|HelpCommand|new Map|definitions/);
    const factory = await readFile(join(sourceRoot, 'domain/ShapeFactory.ts'), 'utf8');
    expect(factory).not.toMatch(/switch\s*\(|case\s+|from ['"][^'"]*(?:Rect|Circle|Ellipse|Line|Text|Group)/);
    const createFactory = await readFile(
      join(sourceRoot, 'plugins/builtin-commands/factories/CreateShapeCommandFactory.ts'), 'utf8'
    );
    expect(createFactory).not.toMatch(/new Map|SpecBuilder|builtin-shapes/);
  });

  it('[ARCH-P2-03] keeps traversal, query and SVG adapters open to provider types', async () => {
    const targets = [
      'domain/visitor/ShapeVisitor.ts', 'domain/visitor/ShapeCollector.ts',
      'application/queries/DocumentViewVisitor.ts', 'infrastructure/SvgWriteVisitor.ts',
      'infrastructure/SvgReader.ts', 'infrastructure/SvgElementFactory.ts', 'infrastructure/SvgElement.ts',
      'infrastructure/DecodedSvgElement.ts'
    ];
    for (const target of targets) {
      const source = await readFile(join(sourceRoot, target), 'utf8');
      expect(source).not.toMatch(/visit(?:Rect|Circle|Ellipse|Line|Text)|enterGroup|leaveGroup/);
      expect(source).not.toMatch(/from ['"][^'"]*(?:shapes|specs)\/(?:Rect|Circle|Ellipse|Line|Text|Group)/);
      expect(source).not.toMatch(/builtin-shapes|new Map/);
    }
  });
});
