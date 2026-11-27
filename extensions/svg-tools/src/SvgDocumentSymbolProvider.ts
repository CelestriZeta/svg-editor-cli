import { DocumentSymbol, Range, SymbolKind } from 'vscode';
import type { CancellationToken, DocumentSymbolProvider, TextDocument } from 'vscode';

import type { SvgOutlineElement } from './outline/SvgOutlineElement.js';
import { SvgOutlineParser } from './outline/SvgOutlineParser.js';

export class SvgDocumentSymbolProvider implements DocumentSymbolProvider {
  public constructor(private readonly parser = new SvgOutlineParser()) {}

  public provideDocumentSymbols(
    document: TextDocument,
    token: CancellationToken
  ): DocumentSymbol[] {
    if (token.isCancellationRequested) {
      return [];
    }
    const pending: Array<readonly [SvgOutlineElement, DocumentSymbol]> = [];
    const adapt = (element: SvgOutlineElement): DocumentSymbol => {
      const symbol = this.createSymbol(element, document);
      pending.push([element, symbol]);
      return symbol;
    };
    const symbols = this.parser.parse(document.getText()).map(adapt);
    // 用显式工作栈保留树结构，避免合法的深层嵌套耗尽 JS 调用栈。
    for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
      const [element, symbol] = next;
      symbol.children = element.children.map(adapt);
    }
    return symbols;
  }

  private createSymbol(
    element: SvgOutlineElement,
    document: TextDocument
  ): DocumentSymbol {
    const start = document.positionAt(element.start);
    return new DocumentSymbol(
      element.name,
      '',
      SymbolKind.Object,
      new Range(start, document.positionAt(element.end)),
      new Range(start, document.positionAt(element.selectionEnd))
    );
  }
}
