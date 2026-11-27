# 实验报告引用材料

本目录集中保存报告引用的资源；源码、测试用例、ADR 和报告正文保留各自职责目录。资源迁移只调整路径，原始日志、数据、截图和 SVG 内容保持不变；文档中的历史验证不代表本次重新执行。

| 目录 | 材料 |
|---|---|
| [images](images/) | 项目实际截图及课程示意图，两者在报告中区分 |
| [vscode](vscode/README.md) | 原生大纲观察图、扩展宿主结果及安装/导航验证 |
| [cli](cli/) | 分步检查、基线及 [Phase 2 最终证据](cli/phase2/validation.txt) |
| [manual_test](manual_test/) | Phase 1 手工回放输入、外部 SVG 与输出 |
| [transcript](transcript/) | box 和新命令的纯输入及 SVG 样本 |
| [docs/metrics](../../docs/metrics/README.md) | 按作业指定目录保留的 Git 文件清单、职责和指标 |

一般材料的脚本输出和报告链接已同步迁移；指标材料与指标脚本输出保留在作业指定的 docs/metrics，不迁入本目录。测试自身固定样本仍在 tests/fixtures，以维持 final 基线与测试独立性。

transcript/typical.txt 和 flowchart.txt 是 tests/fixtures/acceptance 对应输入的字节一致副本，专供报告引用；测试固定样本未移动。
