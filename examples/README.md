# 课程实例回放

两个脚本只包含 `phase_cli_1.md` 中需要输入的 CLI 命令，不含 `svg>` 提示符和执行结果：

- [typical.txt](typical.txt)：第 6 节的典型会话，包含分组、移动、撤销重做、保存与读取。
- [flowchart.txt](flowchart.txt)：第 6.1 节的两节点流程图，使用本阶段支持的普通容器组合。

第一份脚本读取的 [other.svg](other.svg) 同样取自需求原文。请在 `examples` 目录回放，使相对文件路径正确解析。

从项目根目录执行以下 PowerShell 命令，先构建，再分别回放：

```powershell
pnpm run build
Push-Location examples
try {
  Get-Content -Encoding utf8 typical.txt | node ../dist/bootstrap/entry.js
  Get-Content -Encoding utf8 flowchart.txt | node ../dist/bootstrap/entry.js
} finally {
  Pop-Location
}
```

PowerShell 管道传输中文时需要使用 UTF-8；若当前终端没有配置，可在回放前执行：

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
```

回放后会在 `examples` 下生成 `demo.svg` 和 `flowchart.svg`，可以用浏览器打开查看。重复回放会覆盖这两个输出文件。

典型会话中的 `group bad c1 markers` 和保存后的 `undo` 本就用于演示错误，预期分别返回禁止同时分组祖先与后代、IO 后禁止撤销的提示。
