# SVG Explorer & Outline

在 VSCode Explorer 中给 SVG 文件显示 `[]`，并在原生 Outline 视图展示 SVG 元素层级。节点显示 `标签名#id`（没有 id 时仅显示标签名），点击节点定位源码；编辑后自动更新，XML 不完整时暂时清空。

扩展只读取文件和文本，不修改文件名、内容或 CLI 文档。支持 `.svg` 和 `.SVG`；目录（包括 `folder.svg`）不加标记。使用 VSCode 文件系统 API，可由宿主提供远程文件访问。

## 开发运行

在仓库根目录执行 `pnpm install --frozen-lockfile`，用 VSCode 打开仓库，按 F5，选择 `SVG Tools: Extension Host`。构建任务会生成独立的 CommonJS bundle，并启动打开 examples 的 Extension Development Host。

展开 Explorer 下方的 Outline，打开 `scene.svg`：检查 `[]`、`svg → g#flow → g#labels → text` 层级，点击 `rect#start` 应定位到第 3 行。修改 id、临时删去闭合标签、再撤销编辑，观察大纲更新与恢复。`notes.txt` 和 `folder.svg` 目录均无标记。

从 0.1.1 开始，扩展通过 `configurationDefaults` 将 SVG 的默认编辑器关联为 Text Editor，保证原生 Outline 按资源导航时回到源码。仍可通过 **Reopen Editor With... → Image Preview** 显式预览图片。扩展不自动写入用户或工作区设置。

若已有显式的 SVG → Image Preview 关联，需在设置中的 `workbench.editorAssociations` 将对应项改为 `default`；保留其他文件类型的现有项。例如：

```json
"workbench.editorAssociations": {
  "*.[sS][vV][gG]": "default"
}
```

安装新版后执行 **Developer: Reload Window**，并将已打开的 SVG 通过 **Reopen Editor With... → Text Editor** 重开。仅手工打开过一次源码，并不会改变后续导航使用的默认编辑器。

## 测试与安装

从仓库根目录执行：

```sh
pnpm run check:extension
pnpm run test:extension:host
pnpm run build:extension
pnpm run package:extension
code --install-extension extensions/svg-tools/dist/svg-tools-0.1.1.vsix --force
```

宿主测试默认由 `@vscode/test-electron` 下载 VSCode；可设置 `VSCODE_EXECUTABLE_PATH` 为已有的 **Code.exe 可执行文件**（不是 code.cmd）以离线使用本地 VSCode。测试使用独立临时用户配置，不加载用户安装的其他扩展。

`check:extension` 包括严格类型检查、Vitest 单元测试和构建；`test:extension:host` 验证真实注册、原生符号查询、未保存编辑、无效 XML 恢复、文件类型判断和文件不变。界面验证及模式分析见仓库 `doc/README.md`。
