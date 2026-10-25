# 阶段 8 验收记录

项目说明与一致性自查见 [提交文档](../README.md)，详细开发记录见 [WORK_MEMORY](../WORK_MEMORY.md)。

## 可重复运行

在仓库根目录运行：

```powershell
node_modules/.bin/tsc.cmd --noEmit
node_modules/.bin/vitest.cmd run
node scripts/clean.mjs
node_modules/.bin/tsc.cmd -p tsconfig.build.json
```

全量测试中的 `course-acceptance.test.ts` 会清理并构建生产入口，再启动真实 Node CLI 进程；各场景使用独立临时目录，不覆盖仓库中的验收样本。需要已安装项目锁定依赖。

`npm run cli` 已用管道输入 help 实际启动验证，输出完整命令帮助并正常退出。npm 对项目现有 pnpm 专用 `node-linker` 配置打印兼容性警告，不影响本轮运行。

手工回放示例（先构建，在案例目录运行）：

```powershell
Push-Location tests/fixtures/acceptance
Get-Content -Encoding utf8 typical.txt | node ../../../dist/bootstrap/entry.js
Get-Content -Encoding utf8 flowchart.txt | node ../../../dist/bootstrap/entry.js
Pop-Location
```

命令将重新生成该目录中的 demo.svg 和 flowchart.svg。交互运行可在仓库根目录执行 `npm run cli`；非交互脚本不显示 `svg>` 提示符。若终端不是 UTF-8，请改用测试中的 Node 子进程方式，以保持中文编码。

## 场景与核对

- [typical.txt](../../tests/fixtures/acceptance/typical.txt) 直接取自需求第 6 节命令；[完整期望输出](../../tests/fixtures/acceptance/typical.expected.txt) 经逐项对照，包含创建/分组、树、移动、undo/redo、文本更新/恢复、非法分组、删除/恢复、保存屏障及缺 id 警告。
- [other.svg](../../tests/fixtures/acceptance/other.svg) 为需求提供的外部样本。读取 7 个元素，补齐 rect1；另存再读无新警告，树与序列化模型语义一致。
- [flowchart.txt](../../tests/fixtures/acceptance/flowchart.txt) 取自需求第 6.1 节版本 A；[完整期望输出](../../tests/fixtures/acceptance/flowchart.expected.txt) 验证 8 个元素、嵌套归属、容器移动/撤销及中文文字更新。
- CLI 回放另行验证失败创建、读取、保存、属性与结构操作不破坏树、默认路径、redo 和 IO 屏障。
- 保存故障注入使用真实旧文件，分别模拟临时文件创建失败、部分写入失败和同目标 rename 失败，核对旧文件、临时文件清理、树、历史与默认路径。

需求 transcript 中用于对齐的空格按现有 formatter 固定宽度输出；线段树条目额外显示显式 stroke。启动提示使用 ASCII 连字符。这些展示差异保留，不修改需求原文。

本轮发现容器移动撤销摘要的增量方向与需求相反。先将两个回归期望改为实际反向增量并确认失败，再修正 MoveShapeCommand 的语义结果；几何仍通过精确局部记录恢复。应用层不拼接文案，CLI 不计算领域几何。

## 自动化结果

严格类型检查通过；31 个测试文件、96 个测试通过；清理后生产构建通过。新增 2 个测试文件、6 个测试；扩展无文档命令与 init 清理历史/路径的既有用例。运行期导入环、层级依赖、单文件单类、Command 变更入口、集中分派和范围守卫均通过。未声称本轮执行了新的依赖漏洞审计。

## 浏览器视觉检查

使用已安装的 Microsoft Edge 无头模式，以独立的 `.cache/acceptance-render` 配置目录打开本地 SVG，窗口尺寸 820×640；成功生成并实际查看以下截图：

- [demo.png](demo.png)：白色背景、左上角 My Diagram、中心 (130,100) 的红圆及位于 (200,80) 的蓝矩形可见，大小和相对位置正确。
- [flowchart.png](flowchart.png)：蓝色开始节点、橙色处理节点及黑色连接线完整可见；“开始”和“处理数据 v2”中文正常；第二节点在撤销后回到 y=100，文字随组恢复。连接线没有箭头头部，与需求 line 定义一致。

初次 Computer Use 因无法可靠识别浏览器 URL 停止，未继续该 UI 操作；随后受限环境的无头进程也未生成截图。最终以获准的独立无头进程完成本地文件渲染，未使用用户已有浏览器配置。证据覆盖真实浏览器渲染及截图观察，不包含用户亲自检查或跨浏览器验证。

渲染可复用如下 Edge 参数，分别将输入改为两个 SVG，输出改为对应 PNG（路径按实际仓库位置调整）：

```text
msedge.exe --headless --disable-gpu --disable-background-networking --no-first-run --no-default-browser-check --user-data-dir=<repo>/.cache/acceptance-render --window-size=820,640 --hide-scrollbars --screenshot=<repo>/doc/acceptance/demo.png file:///<repo>/tests/fixtures/acceptance/demo.svg
```

## Git 交付边界

未暂存、提交、推送或创建 final tag。代码与证据留在工作区供用户检查；最终提交信息由用户提供，推送及 final tag 仍需用户后续明确指令。
