# Git 历史指标

- [框架节点文件清单](framework/files.md)、[框架原始数据](framework/metrics.json)：从普通提交 `50ba852` 生成。
- [Phase 2 汇总](phase2/summary.md)、[逐文件职责](phase2/files.md)、[原始数据](phase2/metrics.json)：完整业务实现的最终指标。

复现最终标签的指标：

```sh
node scripts/metrics.mjs final p2 docs/metrics/phase2
git diff --exit-code -- docs/metrics/phase2
```

脚本只从 Git 读取生产 TypeScript，排除依赖、产物、测试和文档。CLI 分为 kernel（含终端和 IO 适配）、assembly、plugins；VSCode 为独立 vscode 类别。物理行数包括注释及空行。复杂度口径为有实现的函数/方法/访问器基础值，加 if、循环、catch、非 default case、条件表达式及 `&&`/`||`/`??` 决策；通过实际安装的 TypeScript 7 原生 AST 分析，字符串和注释不被误计。

最终输出记录生产源码树指纹，而不嵌入包含本指标文件的提交 SHA，避免提交自引用。文档和证据收尾不改变生产源码树；在 `p2` 上重跑应逐字节一致。生成时实际使用的 Git ref/SHA 会打印到控制台。指标仅体现该口径下的结构变化，不将代码迁移产生的内核行数下降等同于功能复杂度消失。
