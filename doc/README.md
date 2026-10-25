# Lab1 Phase 1：SVG 编辑器（CLI）项目文档

需求依据：[`phase_cli_1.md`](../phase_cli_1.md)。本文件按作业要求位于 `doc/README.md`，作为完整项目文档。

当前阶段：已完成工程基线、需求边界固化、测试清单及阶段 2 最小纵向链路，并在阶段 2 代码审查后完成输入、命令、历史、结果、查询视图和目录粒度的架构收紧。阶段 2 已打通 `init -> create rect -> tree -> save`，其余六种图形、完整编辑、undo/redo 命令和 SVG 读取仍待后续阶段实现；最终一致性自查结论保持待填写。

## 1. 架构方案

### 1.1 目标与范围

本阶段用 TypeScript 实现 CLI SVG 编辑器，支持 `rect`、`circle`、`ellipse`、`line`、`text`、`g` 六种图形，以及文档读写、图形编辑、查询和撤销重做。

采用面向对象设计：字段封装、类层次与多态，一类一文件，文件名与类名一致。GUI、宿主集成、动态插件和 `box` 留待后续阶段。以下内容仍以完整目标架构描述；实际实现范围见当前阶段说明和验证记录。

### 1.2 模块职责

系统分为交互、应用、领域和基础设施四层，由启动模块组装。

| 目录 | 职责 | 主要对象 |
|---|---|---|
| `src/cli/` | 输入分词、委托命令创建与执行、结果排版 | Repl、CommandLineParser、OutputFormatter |
| `src/application/` | 命令调度、执行、会话、历史和文档协调 | CommandDispatcher、CommandExecutor、EditorSession、CommandHistory、DocumentService |
| `src/application/commands/` | 内置具体命令，保存参数及撤销行为 | InitCommand、CreateShapeCommand、TreeCommand、SaveCommand、HelpCommand |
| `src/application/commands/contracts/` | Command、撤销、结果及结果 Visitor 契约 | Command、UndoableCommand、CommandCategory、CommandResult |
| `src/application/commands/results/` | 语义化命令结果 | CanvasCreatedResult、ShapeCreatedResult、DocumentSavedResult、TreeResult |
| `src/application/commands/support/` | 命令执行公共支持 | CommandExecutionGuard |
| `src/application/queries/` | 只读查询投影和查询访问者 | DocumentViewVisitor、DocumentView、ShapeView、RectView |
| `src/application/ports/` | 应用需要的外部读写接口 | DocumentStore |
| `src/domain/` | 几何、文档树、图形工厂及领域错误 | SvgDocument、ShapeFactory、DomainError |
| `src/domain/document/` | 文档 id、顺序和树结构不变量 | SvgDocument |
| `src/domain/shapes/` | 图形层次和 Composite 叶子/容器 | Shape、Rect、后续 Group 与其它图形 |
| `src/domain/specs/` | 类型化的图形创建规格 | ShapeSpec、RectSpec |
| `src/domain/visitor/` | 领域遍历契约 | ShapeVisitor |
| `src/infrastructure/` | SVG 编解码和文件读写 | SvgReader、SvgWriteVisitor、SvgDocumentStore |
| `src/bootstrap/` | 创建对象、注入依赖、注册命令、启动 CLI | Main |
| `tests/` | 单元测试、IO 集成、CLI 回放和 SVG 样本 | |
| `doc/` | 项目说明、工作记忆和验收记录 | |

命令调度、执行、会话、历史和文档协调直接放在 application 下。具体命令与契约、结果、公共支持分开；查询模型与访问者集中在 queries；领域按 document、shapes、specs 和 visitor 分组。各生产类仍独立成文件，不使用 barrel 导出隐藏依赖。

编辑命令直接以 SvgDocument 为接收者，查询命令委托 DocumentViewVisitor。DocumentService 负责初始化、读取、保存及画布调整的会话协调，通过 DocumentStore 使用 IO，不管理历史。TreeFormatter、ShowFormatter 放在 cli 中，只排版查询模型。

### 1.3 模块关系

图按从上到下展开，保留 application 内部职责。箭头指向被依赖方，虚线表示启动组装；完整规则见 1.7。执行器和历史只依赖 commands 中的命令契约，不依赖具体命令类。

```plantuml
@startuml
!pragma layout smetana
top to bottom direction
skinparam backgroundColor white
skinparam shadowing false
skinparam componentStyle rectangle
skinparam packageStyle rectangle
skinparam defaultFontName "Microsoft YaHei"
skinparam defaultFontSize 14
skinparam ArrowColor #64748B
skinparam ArrowThickness 1
skinparam roundCorner 8
skinparam nodesep 30
skinparam ranksep 40
skinparam padding 8
skinparam component {
  BorderColor #94A3B8
  FontColor #1E293B
}
skinparam package {
  BorderColor #CBD5E1
  FontColor #334155
  FontStyle bold
}

component "bootstrap" as boot #F1F5F9
component "cli" as cli #EFF6FF
package "application" as app #FAFBFE {
  together {
    component "CommandDispatcher" as dispatcher #EEF2FF
    component "CommandExecutor" as executor #EEF2FF
  }
  together {
    component "CommandHistory" as history #F8FAFC
    component "commands" as commands #EEF2FF
  }
  together {
    component "DocumentService" as documents #EEF2FF
    component "DocumentViewVisitor" as views #F8FAFC
  }
  together {
    component "EditorSession" as session #F8FAFC
    component "ports" as ports #F8FAFC
  }
  dispatcher -[hidden]right-> executor
  history -[hidden]right-> commands
  dispatcher --> commands
  dispatcher --> session
  dispatcher --> documents
  executor --> commands
  executor --> history
  history --> commands
  commands --> documents
  commands --> views
  documents --> session
  documents --> ports
  commands -[hidden]down-> views
  views -[hidden]down-> session
}
component "infrastructure" as infra #FFF7ED
component "domain" as domain #ECFDF5
boot ..> cli
boot ..> app
boot ..> infra
cli --> dispatcher
cli --> executor
commands --> domain
views --> domain
session --> domain
documents --> domain
ports --> domain
infra --> ports
infra --> domain
session -[hidden]down-> domain
@enduml
```

### 1.4 设计模式

| 模式或手段 | 如何使用 | 主要取舍 | 实现证据 |
|---|---|---|---|
| Command | 每条请求封装为命令；执行器统一调用，历史保存可撤销命令 | 命令只转发，业务规则留在接收者中 | 阶段 2：`InitCommand`、`CreateShapeCommand`、`TreeCommand`、`SaveCommand`；`UndoableCommand` 独立于普通 Command |
| Composite | Shape 统一叶子与容器操作，Group 递归处理子节点 | 树的防环、父级和 id 约束仍须显式校验 | 阶段 2 仅有 `Rect` 和文档根；`Group` 与统一操作待阶段 3 |
| Visitor | accept 负责遍历，访问者负责查询投影和 SVG 输出 | 适合当前固定的六种类型；新增图形需要复评访问协议 | 阶段 2：`Rect.accept` 连接 `DocumentViewVisitor` 与 `SvgWriteVisitor`；查询模型另由 `ShapeViewVisitor` 多态排版 |
| Adapter | SvgDocumentStore 实现 DocumentStore，封装文件 API 和 SVG 编解码 | 应用和领域不接触外部库类型 | 阶段 2：`SvgDocumentStore` 隔离 Node.js 文件 API 与临时文件替换 |
| Iterator | 用标准 Iterable 顺序访问子节点 | 隐藏可变集合，不另建遍历框架 | 阶段 2：`SvgDocument.children` 返回只读迭代入口 |
| 集中创建 | CommandDispatcher 注册内置命令；ShapeFactory 创建图形 | 静态装配，不实现动态加载；图形创建属于简单工厂 | 阶段 2：命令描述表同时驱动分发与 help；图形工厂接收 `ShapeSpec`，不解析命令行 token |

#### 图形与文档

SvgDocument 统一管理树结构和 id 索引，提供创建、删除、分组、解组、重新挂接和排序操作。根画布不是第七种可创建图形。

Shape 封装 id、样式和几何行为。叶子修改自身，Group 递归执行 move/scale。结构原语采用透明式接口：叶子明确拒绝添加子节点，Group 提供实现；写入口限制在文档协作内部，避免绕过索引和防环校验。删除叶子和删除子树都由文档统一处理。

普通 g 的 set 修改自身允许的样式，保留 SVG 继承，不覆盖子孙显式样式。scale 同乘位置和尺寸，不能只改大小。

#### 遍历与展示

ShapeVisitor 提供各叶子的 visit 方法，以及 enterGroup/leaveGroup。Group.accept 按“进入、递归、离开”遍历；访问者不再自行递归。enterGroup 可跳过子树，使 show 只读取目标本身。

DocumentViewVisitor 生成只读查询模型，SvgWriteVisitor 生成 SVG。访问者只读必要属性，不获取可写字段。Iterable 隐藏有序子节点集合；遍历期间不修改结构，先收集变更再提交。

### 1.5 命令执行

各对象分工如下：

| 对象 | 负责什么 |
|---|---|
| CommandLineParser | 通用分词，保留引号语义和颜色参数 |
| CommandDispatcher | 按命令名查描述符，校验参数并创建命令 |
| CommandExecutor | 串行执行，等待 IO 完成，协调历史 |
| 具体 Command | 保存参数、接收者和撤销句柄，调用接收者 |
| SvgDocument / Shape | 完成图形操作与校验 |
| DocumentService | 协调会话替换、保存路径及 IO |
| DocumentViewVisitor | 生成只读查询结果 |
| CommandHistory | 维护两个栈及历史屏障 |

以 `move r1 30 0` 为例：

```text
分词 → 创建 MoveCommand → 执行器调用 execute()
     → SvgDocument.move() → Shape
     → 提交局部变更和历史 → CLI 显示结果
```

命令不得直接改坐标、操作子节点集合、维护索引或读写文件。编辑命令绑定当前 SvgDocument，调用其受控操作；查询命令委托独立的查询访问者。分发器从 EditorSession 取得当前文档后创建命令，每次查询使用新的访问者，避免残留状态。初始化和读写命令绑定 DocumentService；文档替换成功后清理旧历史，避免旧命令误用新文档。undo/redo 由统一命令入口交给执行器，不进入编辑历史，也不反向依赖具体命令。

按名字分派只保留两处：CommandDispatcher 和 ShapeFactory，作为后续扩展时的重构点。SVG 导入复用同一图形工厂，不再增加标签 switch。

Main 在启动时注册内置 CommandDescriptor，包含名称、参数解码、帮助和创建方法。重复名称在接收命令前报错；help 与描述符同源。执行类别由命令表达，canvas 查询与修改的历史行为分别处理。

### 1.6 撤销重做与失败处理

历史保存命令及封装的局部 ChangeSet，不为每个小编辑复制整份文档。

| 操作 | 撤销需要保留的信息 |
|---|---|
| create | 新节点、父级和插入位置 |
| delete | 完整子树、原父级、原位置和索引恢复信息 |
| move / scale | 受影响节点修改前后的精确几何值 |
| set | 新旧值，以及原属性是否存在 |
| group / ungroup / addto | 相关父级的有序子列表、父引用、容器和索引变化 |
| front / back | 父级、原位置和目标位置 |

首次执行保存记录，undo 恢复旧状态，redo 应用已保存的新状态。重做不重新分配 id，不覆盖首次记录；恢复几何使用旧值，避免反向计算的浮点误差。记录绑定文档，文档替换后清除旧历史。一次复杂树编辑仍是一个撤销单元。

| 请求 | 成功后的历史变化 |
|---|---|
| 新编辑 | 压入 undo，清空 redo，解除屏障 |
| undo / redo | 恢复成功后，才把命令转移到另一栈 |
| 查询、无参 canvas | 不变 |
| init / read / save / 修改 canvas | 清除旧历史，禁止撤销重做，直到下一次编辑成功 |

**失败命令保持全部状态不变**，包括文档、默认路径、两个历史栈和屏障。

领域操作先准备局部候选状态，完成数值、id、父级和顺序校验，再同步提交。多节点运算必须先全部算完并检查有限数值，避免部分节点已改、后续节点报错。提交前准备好变更记录和目标历史；提交中不做 IO 或外部回调。仍可能失败的步骤必须能够完整回滚，并通过失败注入验证。

read 先构造和校验候选文档，成功后再替换。save 先写同目录临时文件，成功替换目标后才更新路径和历史；失败保留原文件及会话，并清理临时文件。文件替换能力需按实际平台验证，进程崩溃和内存耗尽不属于可恢复命令错误的保证范围。

导入时先检查所有显式 id，再为缺 id 节点分配不冲突的“标签名+序号”；警告仅在整次读取成功后返回。SVG 读写正确处理命名空间和转义，省略的 fill/stroke 不补写。

### 1.7 依赖规则

| 模块或对象 | 允许依赖 |
|---|---|
| domain | 标准能力和本模块 |
| commands/contracts | 标准能力及必要的内部结果契约 |
| commands/results | 命令契约及只读查询结果 |
| commands/support | 命令契约、结果、领域错误和端口错误 |
| 具体命令 | 命令契约、结果、公共支持、领域和 DocumentService |
| EditorSession、ports | domain |
| DocumentService | EditorSession、ports、domain |
| queries | domain 及其只读查询模型 |
| CommandHistory | Command / UndoableCommand 契约 |
| CommandExecutor | 命令契约、CommandHistory |
| CommandDispatcher | 命令创建器、EditorSession、DocumentService |
| cli | Dispatcher、Executor、命令结果及查询模型、终端能力 |
| infrastructure | ports、domain 及必要的 IO/XML 库 |
| bootstrap | 需要组装的生产模块 |
| tests | 被测模块和测试工具 |

目录合并不改变职责和依赖方向。领域不依赖终端、文件系统、XML 库或宿主 SDK；命令不依赖执行器和历史；DocumentService 不依赖具体命令或历史。命令契约、会话和查询模型都是内部协作约定，不构成对外 SDK。

禁止跨层循环依赖。commands 中的契约与具体实现分文件导入，执行器和历史不通过导出全部命令的桶文件访问契约。领域 Visitor 与图形的类型引用优先使用 type-only，避免运行时循环加载。生产代码不依赖测试，其他生产模块不依赖 bootstrap。

### 1.8 变化点与扩展取舍

| 可能的变化 | 当前安排与原因 | 后续工作 |
|---|---|---|
| 新命令 | 集中注册，复用执行器和历史 | 增加接收者行为、薄命令、描述符和测试 |
| GUI | 命令与领域独立于终端，查询与排版分离 | 增加界面、命中检测、预览和提交后通知 |
| 宿主集成 | DocumentStore 隔离存储，不绑定 SDK | 在 VS Code、DeepSeek harness 等实际宿主中适配入口、存储和生命周期 |
| 统一应用接口 | **不预留 EditorApi**：目前只有 CLI，其他入口需求未定，固定协议缺少验收依据且增加维护成本 | 第二个实际入口出现后，再提取共享接口和契约测试 |
| 动态插件 | 内置命令静态注册、图形集中创建，不实现加载器 | 明确版本、名称冲突、卸载和历史引用的存活规则 |
| 新图形与 box | 当前仅六种类型；Composite 支持组合 | box 可复用基础子树，但仍需属性和序列化契约；任意新类型需复评 Visitor |
| XML 库和存储 | 外部能力通过接口注入 | 替换适配器并验证契约 |
| 历史规模 | 记录随受影响范围增长，不复制无关节点 | 有性能证据后再设计容量与持久化 |

宿主集成和编辑器加载插件是两件事：前者把已有能力接到另一个应用，后者扩展编辑器自身。两者都不在本阶段实现，也不预先固定通信协议。

未来 GUI 的选择、视口和拖拽预览留在界面层。一次拖拽默认在释放时提交一次命令，取消不改文档；多视图在提交后通知，监听失败不回滚成功编辑。宿主接入时需明确由谁管理撤销，避免两套历史失配；关闭和重载经应用流程处理。跨进程传输届时定义请求和结果，不序列化持有接收者的命令对象。

### 1.9 已明确的实现边界

以下决策用于固定阶段一之后的实现和测试；若后续需求补充改变语义，再修订本节，不在实现中静默改变。

- **跨父容器 group**：新容器挂到所有被选图形的最近公共祖先，作为该祖先最后一个子节点；子节点按命令给出的 id 顺序排列。若最近公共祖先本身也是被选图形，则属于祖先与子孙同时选择，按已有规则拒绝。
- **外部 SVG 范围**：只接受标准 SVG 命名空间下的 `svg`、`g`、`rect`、`circle`、`ellipse`、`line`、`text`。允许 id、fill、stroke、stroke-width、各图形自身几何属性和 text 子文本；根元素另允许 width、height、viewBox。缺 id 时按标签名和序号补齐并警告。
- **不支持内容**：`transform`、`style`、`class`、`defs`、未知图形、未知属性及其他未建模内容一律报错，读取失败且当前文档不变，不能静默丢弃后保存。
- **viewBox**：允许省略，或必须等于 `0 0 <width> <height>`；其他 viewBox 需要尚未建模的坐标变换，因此明确拒绝。
- **text 缩放**：只缩放 text 的 x、y 坐标；当前不把 font-size 或 text-anchor 纳入模型，也不扩大 `set` 白名单。
- **保存路径**：`read` 和成功带路径的 `save` 更新当前默认路径，后续无参数 `save` 使用该路径；`init` 清除默认路径。失败命令不更新路径。
- **无文档命令**：`help` 不依赖文档，可在 `init` 或 `read` 前使用；其余命令在无文档时报 `error: no document. use 'init' or 'read' first`。
- **元素计数**：不计根 `svg`，统计树中全部图形和 `g` 容器，包括嵌套节点；该规则用于消除需求示例中的计数差异。
- **阶段 2 的最小画布与路径错误**：`init` 的宽高必须是正有限数，否则返回 `error: canvas width and height must be positive finite numbers`；`init` 后无参数 `save` 返回 `error: no file path; use 'save <file.svg>'`，会话保持不变。

## 2. 与 AI 协作的过程记录

保留影响架构和交付的关键讨论。实现状态以“当前状态”和各阶段实际验证记录为准。

| 日期 | 讨论与问题 | 决策 |
|---|---|---|
| 2026-10-16 | 整理需求并初始化项目 | 拟定分层架构，采用 Command 和 Composite；实现证据与验收结论留空 |
| 2026-10-25 | 文档位置需要符合提交要求 | 将完整 README 从根目录移至 doc/，同步链接和协作约定 |
| 2026-10-25 | AI 初始建议每次编辑保存全文快照，小编辑也会复制无关数据 | 改为命令加局部变更记录，明确接收者、执行器及失败原子性的职责 |
| 2026-10-25 | 考虑新命令、GUI 和宿主集成时，AI 提前预留了统一 EditorApi | 用户明确当前不需要；保留命令、领域和 IO 分层，待实际新增入口后再提取接口，并说明当前不留的原因 |
| 2026-10-25 | 应用层目录过细，编辑和查询 Service 主要是转发 | 压平单类目录，命令直接委托领域或访问者；保留文档读写协调、独立执行器、历史及存储接口，并同步依赖图 |
| 2026-10-25 | 阶段一需要建立可验证的工程基线并固定实现边界 | 采用 Node.js 24、pnpm、TypeScript 严格模式和 Vitest；建立模块目录、冒烟测试及分层测试清单，并把跨父级 group、SVG 支持范围、文本缩放、路径和历史相关边界写入 1.9 |
| 2026-10-25 | 初版测试清单只有功能方向，缺少参数级、精确错误、失败原子性和边界决策验证 | 按领域、变更记录、命令与历史、SVG IO、CLI 和端到端扩展为带 ID 的测试矩阵；统一加入 `FAIL-STATE` 断言，并明确本阶段不适用的复合图形与插件测试 |
| 2026-10-25 | 阶段 2 需要验证分层是否真正可调用，而不是只建立空目录 | 先写 CLI 纵向链路和失败边界测试并确认因缺失模块失败，再实现最小 Command、查询 Visitor、文档、会话、历史、SVG 写入与 REPL；构图和编辑能力未提前展开 |
| 2026-10-25 | 阶段 2 审查发现领域解析 CLI token、历史记录普通 Command、展示文案位于应用层、help 与分发重复、异常被重复兜底及 Rect 排版硬编码 | 改为 `RectSpec` 类型输入；拆分 `Command`/`UndoableCommand`；引入语义 Result；命令描述表单源；预期错误统一 Guard、未知错误保留 cause；新增 `ShapeViewVisitor`；测试按边界拆分 |
| 2026-10-25 | 目录审查发现 commands 混合契约、结果和支持类型，查询模型挤在 application 根，领域文件将随六种图形膨胀，测试仍含阶段命名和低价值基线 | 建立 commands/contracts、results、support 和 application/queries；领域按 document/shapes/specs/visitor 分组；集成测试按失败状态、文档生命周期和 help 拆分；删除基线测试与 `.gitkeep` |

## 3. 实现后的一致性自查

### 3.1 模块划分

| 计划模块 | 实际目录与证据 | 是否一致 | 偏差及修订记录 |
|---|---|---|---|
| `cli` | | | |
| `application` / `commands` / `ports` | | | |
| `domain` | | | |
| `infrastructure` | | | |
| `bootstrap` | | | |

模块划分自查结论：

### 3.2 依赖方向

| 抽样模块或文件 | 实际依赖 | 对照规则 | 待处理项或修正证据 |
|---|---|---|---|

依赖方向自查结论：

## 4. 功能完整性与质量保证手段

### 4.1 功能验收矩阵（计划）

逐项测试设计见 [`tests/README.md`](../tests/README.md)。每个测试项均有唯一 ID、测试层级、前置条件、操作和预期结果；失败项统一使用 `FAIL-STATE` 检查完整状态不变。

| 需求范围 | 计划验证内容 | 实际用例与执行结果 |
|---|---|---|
| REPL 与输入 | `svg>`、逐行回放、整行注释、保留颜色参数中的 `#`、双引号与含空格文本、浮点数、统一错误前缀与成功摘要 | 阶段 2：分词、注释、颜色和带空格路径测试通过；构建产物回放通过；`svg>` 提示符待 CLI 阶段 |
| 文档命令 | `init` 默认/指定尺寸，`read`，`save` 指定/沿用路径，`canvas` 查询/修改，无文档错误，文件读写失败 | 阶段 2：`init` 默认/指定/非法尺寸、`save` 显式/沿用/无路径及写入失败通过；`read`、`canvas` 未实现 |
| 六种图形 | 全部创建参数、默认样式属性省略、唯一且大小写敏感的 id、未知类型（包括 `box`）、`in` 成功及两种目标错误 | 阶段 2：`rect` 创建、可选 `fill`、重复 id 和未知类型通过；其余五种图形与 `in` 待阶段 3、4 |
| 编辑与属性 | `delete`、`move`、`scale`、`set` 的叶子与容器行为，白名单、文本、非正缩放及非法参数 | |
| 树结构 | `group`、`ungroup`、`addto`、`front`、`back`；祖先冲突、防环、子树删除、同级顺序、根级解组拒绝 | |
| 显示 | `tree` 全文档/子树、内联几何属性、`show` 的父级与属性、`help` 覆盖全部命令与语法 | |
| 撤销重做 | 每条编辑一个单元、复杂树修改完整恢复、新编辑清 redo、显示不入栈、文档操作屏障、失败无副作用 | 阶段 2：编辑入栈计数、文档操作屏障、失败不变及 `CreateShapeCommand` 的 undo/redo 契约通过；CLI undo/redo 命令待阶段 5 |
| SVG 读写 | 缺 id 警告与碰撞规避、重复 id、XML 转义、命名空间、保存再读语义等价、失败不替换当前文档 | 阶段 2：矩形 SVG 写入、命名空间、可选样式省略路径和写入失败保持会话通过；读取与 round-trip 待阶段 6 |
| 完整场景 | 需求第 6 节典型会话与 6.1 版本 A 流程图，保存后浏览器预览；版本 B 不在本阶段验收 | |

功能完整性结论：阶段 2 最小纵向链路完整可用，可以通过构建产物执行 `init`、`create rect`、`tree` 和 `save`；完整 Phase 1 功能尚未完成，不据此作最终验收结论。

### 4.2 质量保证计划

按 Test → Code → Refactor 推进：先明确行为，再实现和重构。计划分层验证：

| 层次 | 重点 |
|---|---|
| 领域 | 几何、属性白名单、树结构和 id 不变量 |
| 命令 | 执行、撤销、重做后状态精确一致 |
| 执行器 | 串行执行、成功入栈、失败不变、redo 清空和历史屏障 |
| 读写 | 替身模拟失败；临时目录验证真实读写与替换；保存再读比较模型语义 |
| CLI | 分词、帮助、错误格式及典型会话回放 |
| 架构 | 字段封装、一类一文件、两处分派、依赖方向和模式职责 |

复杂编辑比较父级、顺序、属性存在性、几何和 id 索引，不只比较输出。测试可生成完整观察快照用于断言，但生产历史仍只保存局部变更。失败用例同时检查文档、路径和历史；返回模型的修改不能影响领域。

实现后运行严格类型检查、自动化测试及浏览器 SVG 预览，并记录真实结果。GUI 和宿主能力在对应阶段另行验收。开发保持分步提交，最终验收后才创建 `final` tag。

### 4.3 实际验证记录

| 日期 | 验证命令或方法 | 结果 | 证据与剩余问题 |
|---|---|---|---|
| 2026-10-25 | `pnpm run test`（实现 `Main` 前） | 预期失败 | 测试报 `Cannot find module '../src/bootstrap/Main.js'`，确认冒烟测试先于实现失败 |
| 2026-10-25 | `pnpm run check` | 通过 | 严格类型检查通过；1 个工程冒烟测试通过；TypeScript 构建成功。没有业务测试 |
| 2026-10-25 | `pnpm run start` | 通过 | `node dist/bootstrap/Main.js` 退出码为 0；启动类当前不包含业务功能 |
| 2026-10-25 | `pnpm exec vitest run tests/stage2.test.ts`（实现前） | 预期失败 | 报 `Cannot find module '../src/application/CommandDispatcher.js'`，确认阶段 2 测试先于生产实现 |
| 2026-10-25 | `pnpm exec vitest run tests/stage2.test.ts` | 通过 | 4 个阶段 2 测试通过，覆盖最小链路、分词、失败不变和文档替换 |
| 2026-10-25 | `pnpm run build`（首次） | 失败后修正 | 生产构建缺少显式 Node 类型；在 `tsconfig.json` 加入 `"types": ["node"]` 后通过 |
| 2026-10-25 | `pnpm run check` | 通过 | 严格类型检查、2 个测试文件共 5 个测试、生产构建全部通过 |
| 2026-10-25 | `pnpm run start`（管道回放） | 通过 | `entry.js` 依次输出启动提示、画布、矩形、树和帮助，进程正常退出 |
| 2026-10-25 | `create rect empty "" 0 10 10`（架构审查复现） | 失败已确认 | 修复前输出 `rect#empty created`，证明空字符串被 `Number('')` 静默转换为 0；修复后由分发层拒绝 |
| 2026-10-25 | `pnpm run typecheck`、`pnpm run test`（架构修复后） | 通过 | 严格类型检查通过；7 个测试文件、11 个测试通过，覆盖 undo/redo 契约、未知异常不泄漏、真实写入失败和描述表 help |
| 2026-10-25 | `pnpm run check`、`pnpm run start`（架构修复后） | 通过 | 类型检查、7 个测试文件共 11 个测试和构建通过；CLI 回放拒绝空/十六进制数字，tree 与描述表 help 输出正确 |
| 2026-10-25 | `pnpm run typecheck`、`pnpm run test`（目录重整后） | 通过 | 严格类型检查通过；8 个测试文件、10 个测试通过；旧路径、`.gitkeep`、阶段命名测试与基线测试均无残留 |
| 2026-10-25 | `pnpm run check`、`pnpm run start`（目录重整后） | 通过 | 类型检查、8 个测试文件共 10 个测试和生产构建通过；构建产物正常回放 init/create/tree/help |

代码质量结论：阶段 2 已完成针对架构气味和目录粒度的实质重构。领域不再消费 CLI token，历史契约只接收可撤销命令，命令结果与终端排版分离，预期错误和未知故障的边界明确，查询模型通过 Visitor 扩展；目录按职责拆分后单目录最多 6 个文件。完整阶段 3 至 7 功能尚未实现，当前结论仍仅限阶段 2。
