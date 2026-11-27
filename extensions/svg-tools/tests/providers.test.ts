import { beforeEach, describe, expect, it, vi } from 'vitest';

const host = vi.hoisted(() => ({
  stat: vi.fn(),
  registerDecoration: vi.fn(),
  registerSymbols: vi.fn(),
  watcher: { onDidCreate: vi.fn(), onDidChange: vi.fn(), onDidDelete: vi.fn(), dispose: vi.fn() },
  createWatcher: vi.fn(),
  fire: vi.fn(),
  disposeEmitter: vi.fn()
}));

vi.mock('vscode', () => ({
  FileType: { File: 1, Directory: 2, SymbolicLink: 64 },
  FileDecoration: class { constructor(public badge: string, public tooltip: string) {} },
  Range: class { constructor(public start: unknown, public end: unknown) {} },
  DocumentSymbol: class {
    public children: unknown[] = [];
    constructor(public name: string, public detail: string, public kind: number, public range: unknown, public selectionRange: unknown) {}
  },
  SymbolKind: { Object: 18 },
  EventEmitter: class {
    public event = vi.fn();
    public fire = host.fire;
    public dispose = host.disposeEmitter;
  },
  workspace: { fs: { stat: host.stat }, createFileSystemWatcher: host.createWatcher },
  window: { registerFileDecorationProvider: host.registerDecoration },
  languages: { registerDocumentSymbolProvider: host.registerSymbols }
}));

import { SvgFileDecorationProvider } from '../src/SvgFileDecorationProvider.js';
import { SvgDocumentSymbolProvider } from '../src/SvgDocumentSymbolProvider.js';
import { activate } from '../src/extension.js';

import type { CancellationToken, ExtensionContext, TextDocument, Uri } from 'vscode';

const uri = (path: string): Uri => ({ path }) as Uri;
const token = (isCancellationRequested = false): CancellationToken => ({ isCancellationRequested }) as CancellationToken;
const document = (text: string): TextDocument => ({
  getText: () => text,
  positionAt: (offset: number) => ({ line: 0, character: offset })
}) as TextDocument;

beforeEach(() => {
  vi.clearAllMocks();
  host.stat.mockResolvedValue({ type: 1 });
  host.createWatcher.mockReturnValue(host.watcher);
  host.registerDecoration.mockReturnValue({ dispose: vi.fn() });
  host.registerSymbols.mockReturnValue({ dispose: vi.fn() });
  for (const subscribe of [host.watcher.onDidCreate, host.watcher.onDidChange, host.watcher.onDidDelete]) {
    subscribe.mockReturnValue({ dispose: vi.fn() });
  }
});

describe('Explorer decoration provider', () => {
  it('decorates only SVG files, including uppercase suffixes, without writing', async () => {
    const provider = new SvgFileDecorationProvider();
    expect(await provider.provideFileDecoration(uri('/remote/a.SVG'), token())).toMatchObject({ badge: '[]' });
    expect(await provider.provideFileDecoration(uri('/a.svg.txt'), token())).toBeUndefined();
    expect(host.stat).toHaveBeenCalledTimes(1);
    host.stat.mockResolvedValue({ type: 2 });
    expect(await provider.provideFileDecoration(uri('/directory.svg'), token())).toBeUndefined();
    host.stat.mockResolvedValue({ type: 0 });
    expect(await provider.provideFileDecoration(uri('/unknown.svg'), token())).toBeUndefined();
  });

  it('handles missing files, cancellation and cancellation during async stat', async () => {
    const provider = new SvgFileDecorationProvider();
    host.stat.mockRejectedValue(new Error('deleted'));
    expect(await provider.provideFileDecoration(uri('/gone.svg'), token())).toBeUndefined();
    host.stat.mockClear();
    expect(await provider.provideFileDecoration(uri('/a.svg'), token(true))).toBeUndefined();
    expect(host.stat).not.toHaveBeenCalled();
    const pendingToken = { isCancellationRequested: false };
    host.stat.mockImplementation(async () => { pendingToken.isCancellationRequested = true; return { type: 1 }; });
    expect(await provider.provideFileDecoration(uri('/a.svg'), pendingToken as CancellationToken)).toBeUndefined();
  });

  it('invalidates decorations after file changes and owns all subscriptions', () => {
    const subscriptions: { dispose(): unknown }[] = [];
    const provider = new SvgFileDecorationProvider();
    provider.watch(subscriptions);
    const changed = uri('/renamed.svg');
    for (const subscribe of [host.watcher.onDidCreate, host.watcher.onDidChange, host.watcher.onDidDelete]) {
      const callback = subscribe.mock.calls[0]?.[0] as (resource: Uri) => void;
      callback(changed);
    }
    expect(host.fire.mock.calls).toEqual([[changed], [changed], [changed]]);
    subscriptions.forEach(item => item.dispose());
    expect(host.watcher.dispose).toHaveBeenCalledOnce();
    expect(host.disposeEmitter).toHaveBeenCalledOnce();
  });
});

describe('native document symbols', () => {
  it('handles deeply nested source without overflowing the JavaScript call stack', () => {
    const depth = 8000;
    const source = `<svg>${'<g>'.repeat(depth)}<rect/>${'</g>'.repeat(depth)}</svg>`;
    let current = new SvgDocumentSymbolProvider().provideDocumentSymbols(document(source), token())[0];
    for (let level = 0; level < depth; level += 1) { current = current?.children[0]; }
    expect(current?.children[0]?.name).toBe('rect');
  });

  it('adapts nested element and selection ranges for source navigation', () => {
    const provider = new SvgDocumentSymbolProvider();
    const symbols = provider.provideDocumentSymbols(document('<svg><g id="scene"><rect/></g></svg>'), token());
    expect(symbols[0]).toMatchObject({
      name: 'svg',
      children: [{ name: 'g#scene', children: [{ name: 'rect', selectionRange: { start: { character: 19 }, end: { character: 24 } } }] }]
    });
  });

  it('uses current text on every request and returns an empty list during invalid edits or cancellation', () => {
    const provider = new SvgDocumentSymbolProvider();
    let source = '<svg><text id="old"/></svg>';
    const current = { ...document(source), getText: () => source } as TextDocument;
    expect(provider.provideDocumentSymbols(current, token())[0]?.children[0]?.name).toBe('text#old');
    source = '<svg><';
    expect(provider.provideDocumentSymbols(current, token())).toEqual([]);
    source = '<svg><circle/></svg>';
    expect(provider.provideDocumentSymbols(current, token())[0]?.children[0]?.name).toBe('circle');
    expect(provider.provideDocumentSymbols(current, token(true))).toEqual([]);
  });
});

it('registers providers with VSCode and releases them through the context lifecycle', () => {
  const subscriptions: { dispose(): unknown }[] = [];
  activate({ subscriptions } as ExtensionContext);
  expect(host.registerDecoration).toHaveBeenCalledWith(expect.any(SvgFileDecorationProvider));
  const [selector, provider] = host.registerSymbols.mock.calls[0] ?? [];
  expect(selector).toEqual([{ pattern: '**/*.[sS][vV][gG]' }]);
  expect(provider).toBeInstanceOf(SvgDocumentSymbolProvider);
  subscriptions.forEach(item => item.dispose());
  expect(host.registerDecoration.mock.results[0]?.value.dispose).toHaveBeenCalledOnce();
  expect(host.registerSymbols.mock.results[0]?.value.dispose).toHaveBeenCalledOnce();
});
