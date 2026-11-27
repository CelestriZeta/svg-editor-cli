import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as vscode from 'vscode';

import { SvgFileDecorationProvider } from '../../src/SvgFileDecorationProvider.js';

export class ExtensionHostSuite {
  public async run(): Promise<void> {
    const extension = vscode.extensions.getExtension('svg-editor-lab.svg-tools');
    assert.ok(extension, 'development extension must be discovered');
    await extension.activate();
    const folder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(folder, 'example workspace must be open');
    const uri = vscode.Uri.joinPath(folder.uri, 'scene.svg');
    const before = await readFile(uri.fsPath);
    const filesBefore = await vscode.workspace.fs.readDirectory(folder.uri);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    const symbols = await this.symbols(uri);
    assert.equal(symbols[0]?.name, 'svg');
    const group = symbols[0]?.children[0];
    assert.equal(group?.name, 'g#flow');
    assert.equal(group.children[1]?.children[0]?.name, 'text');
    const rect = group.children[0];
    assert.ok(rect);
    assert.equal(document.getText(rect.selectionRange), '<rect');
    assert.equal(rect.selectionRange.start.line, 2);
    assert.equal(rect.selectionRange.start.character, 4);
    assert.equal(document.getText(rect.range), '<rect id="start" x="20" y="50" width="120" height="60" fill="#4a90d9"/>');
    assert.ok(group.range.contains(rect.range));
    assert.ok(!document.isDirty, 'outline queries must leave the document clean');
    await this.navigateToSource(uri, rect.selectionRange.start);
    await vscode.commands.executeCommand('vscode.openWith', uri, 'imagePreview.previewEditor');
    const preview = vscode.window.tabGroups.activeTabGroup.activeTab?.input;
    assert.ok(preview instanceof vscode.TabInputCustom);
    assert.equal(preview.viewType, 'imagePreview.previewEditor');
    await this.navigateToSource(uri, rect.selectionRange.start);
    console.log('PASS host: source navigation resolves to Text Editor at the symbol location');
    console.log('PASS host: native nested symbols, missing ids, source ranges');
    const uppercaseUri = vscode.Uri.joinPath(folder.uri, 'UPPER.SVG');
    await vscode.workspace.openTextDocument(uppercaseUri);
    const uppercaseGroup = (await this.symbols(uppercaseUri))[0]?.children[0];
    assert.equal(uppercaseGroup?.name, 'g#uppercase');
    await this.navigateToSource(uppercaseUri, uppercaseGroup.selectionRange.start);

    try {
      await this.replace(document, '<svg>\r\n  <g id="edited"><path id="new"/></g>\r\n</svg>');
      assert.equal((await this.symbols(uri))[0]?.children[0]?.children[0]?.name, 'path#new');
      await this.replace(document, '<svg><g id="');
      assert.deepEqual(await this.symbols(uri), []);
      await this.replace(document, '<svg><circle id="recovered"/></svg>');
      assert.equal((await this.symbols(uri))[0]?.children[0]?.name, 'circle#recovered');
      console.log('PASS host: unsaved edit refresh, invalid XML and recovery');
    } finally {
      await this.replace(document, before.toString('utf8'));
    }

    const decorations = new SvgFileDecorationProvider();
    const cancellation = new vscode.CancellationTokenSource();
    const stateBeforeDecorations = [document.getText(), document.version, document.isDirty];
    try {
      assert.equal((await decorations.provideFileDecoration(uri, cancellation.token))?.badge, '[]');
      assert.equal((await decorations.provideFileDecoration(uppercaseUri, cancellation.token))?.badge, '[]');
      for (const name of ['notes.txt', 'folder.svg', 'missing.svg']) {
        assert.equal(await decorations.provideFileDecoration(vscode.Uri.joinPath(folder.uri, name), cancellation.token), undefined);
      }
      assert.deepEqual(await readFile(uri.fsPath), before);
      assert.deepEqual(await vscode.workspace.fs.readDirectory(folder.uri), filesBefore);
      assert.deepEqual([document.getText(), document.version, document.isDirty], stateBeforeDecorations);
      console.log('PASS host: real file and directory decorations; filenames and bytes unchanged');
    } finally {
      cancellation.dispose();
    }
    // 写在工作区以外，避免验证日志改变待验收的 Explorer 文件列表。
    if (process.env['SVG_TOOLS_TEST_REPORT']) {
      const { writeFile } = await import('node:fs/promises');
      await writeFile(join(process.env['SVG_TOOLS_TEST_REPORT'], 'host-results.json'), JSON.stringify({
        vscode: vscode.version,
        checks: ['nested-symbols-and-navigation', 'source-editor-resolution', 'explicit-image-preview', 'uppercase-source-navigation', 'unsaved-edits', 'incomplete-xml-recovery', 'file-badges', 'directory-exclusion', 'unchanged-files'],
        passed: true
      }, null, 2) + '\n');
    }
  }

  private async navigateToSource(uri: vscode.Uri, position: vscode.Position): Promise<void> {
    // 覆盖 Outline 依赖的编辑器解析路径，不能用强制源码的 showTextDocument。
    await vscode.commands.executeCommand('vscode.open', uri, {
      selection: new vscode.Range(position, position),
      preview: false
    });
    const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
    assert.ok(activeTab?.input instanceof vscode.TabInputText,
      'symbol navigation must open source text, not Image Preview');
    const editor = vscode.window.activeTextEditor;
    assert.equal(editor?.document.uri.toString(), uri.toString());
    assert.equal(editor.selection.active.line, position.line);
    assert.equal(editor.selection.active.character, position.character);
  }

  private async symbols(uri: vscode.Uri): Promise<vscode.DocumentSymbol[]> {
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', uri);
    // 宿主会把 provider 的空数组规范化为 undefined。
    assert.ok(symbols === undefined || Array.isArray(symbols));
    return symbols ?? [];
  }

  private async replace(document: vscode.TextDocument, text: string): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length)), text);
    assert.equal(await vscode.workspace.applyEdit(edit), true);
  }
}
