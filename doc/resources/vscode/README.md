# 第一部分验证证据

- `native-outline-before.png`：实现前观察现有 Markdown Outline，点击 A.2 标题后定位到第 23 行第 1 列。
- `host-results.json`：`pnpm run test:extension:host` 实际生成；记录 VSCode 版本和检查项，通过时 passed=true。失败时测试脚本覆盖为失败记录，避免沿用旧的成功结论。
- `validation.txt`：本轮 `pnpm run check` 的原始输出及宿主运行的 PASS/退出码摘要。
- `outline-navigation.txt`：0.1.1 导航修复中，新增回归在旧清单下失败、在声明默认源码关联后通过的实际输出摘要。
- [svg-tools-plugin-effect.png](../images/svg-tools-plugin-effect.png)：用户提供的实际演示截图，同时展示 SVG 文件 `[]` 标记、普通文件与目录排除、嵌套大纲和 rect#start 定位到 Text Editor 第 3 行的结果。

`doc/resources/images/vscode-svg-badge.jpg` 与 `vscode-svg-outline.jpg` 是课程原图，不是本扩展的运行证据；同目录的 svg-tools-plugin-effect.png 是本项目的实际演示。

[实验报告](../../README.md)已引用用户提供的实际截图，并按图中可见内容填写界面检查结果；尚未提供的编辑更新与不完整 XML 恢复手工过程结果仍留空。

编辑更新与异常 XML 的自动化证据见 host-results.json 和宿主测试源码；人工操作步骤见实验报告。
