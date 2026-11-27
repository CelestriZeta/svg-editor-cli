import { languages, window } from 'vscode';
import type { ExtensionContext } from 'vscode';

import { SvgDocumentSymbolProvider } from './SvgDocumentSymbolProvider.js';
import { SvgFileDecorationProvider } from './SvgFileDecorationProvider.js';

export function activate(context: ExtensionContext): void {
  const decorations = new SvgFileDecorationProvider();
  decorations.watch(context.subscriptions);
  context.subscriptions.push(
    window.registerFileDecorationProvider(decorations),
    languages.registerDocumentSymbolProvider(
      [{ pattern: '**/*.[sS][vV][gG]' }], new SvgDocumentSymbolProvider()
    )
  );
}
