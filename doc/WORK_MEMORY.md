# 项目工作记忆

最后更新：2026-10-25。

## 事实来源与优先级

- 用户当前指令优先，其次遵循根目录 `AGENTS.md` 的协作约定。
- `phase_cli_1.md` 是课程需求原文；`doc/README.md` 是提交文档和拟定架构。若存在冲突，应记录并确认，不能修改原文消除冲突。
- 本文件记录已知事实、决策和下一步，不把计划写成已完成。

## 当前状态

- 初始化前仓库仅有 `phase_cli_1.md`；尚无源代码、依赖清单、运行脚本或测试。
- 已建立提交文档框架和拟定架构，以及 `.gitignore`、`.gitattributes`、`.editorconfig` 和根目录协作说明。
- 未选择具体 Node.js / TypeScript 版本、XML 库或测试框架，尚未安装依赖。
- 仓库已有分步提交（本次修改前最新提交为 `350c4d6`，移动 README 至 doc 下）；本次仅修改文档，未创建提交、远程、推送或 `final` tag。
- README 的实现证据、验收结果和一致性自查结论留空。
- 按用户最新要求和课程第 1.2 节要求，完整项目文档已从根目录移至 `doc/README.md`，需求相对链接和协作约定已同步更新。

## 已定方案（尚未实现）

- 采用 TypeScript、面向对象、一类一文件；通过 Command 管理命令，通过 Composite 统一容器与叶子操作。
- 模块：`cli`、`application`（子目录仅保留 `commands`、`ports`，其他协调类直接放在 application 下）、`domain`、`infrastructure`、`bootstrap`，具体职责和依赖见提交文档。
- 架构方案已完成模式选型与职责细化，依据项目需求说明取舍。
- AI 协作记录仅保留关键决策，已补充本次目录压平及去除纯转发层的讨论。
- 文档已合并重复说明，依次描述模块、模式、执行、历史和扩展；PlantUML 保留竖向布局及 application 内部组件，节点仅显示名称，用低饱和配色区分层次，省略连线文字及重复契约依赖。
- 用户明确未来新增命令、GUI、VS Code / DeepSeek harness 等宿主集成方向；README 1.8 记录演进边界，尚无业务实现。
- 按用户最新要求，本阶段不预留或实现 EditorApi、通用请求协议、describeCommands；仅 CLI，未来 GUI/宿主需求未定，提前固定接口缺少验收依据并增加维护成本。原因见 README 1.8。
- CLI 委托 CommandDispatcher 创建命令、CommandExecutor 串行执行；命令契约移至 commands，help 与静态描述符同源。未来第二入口出现后再提取应用接口。
- 区分宿主集成和动态扩展；GUI 手势事务、提交订阅、宿主历史/存储适配及进程桥接均留后续，不预设具体 SDK/协议。
- 封闭 Visitor 适用于当前六类型；任意新图形须复评投影/序列化契约，不承诺插件零修改。
- 编辑命令直接绑定当前 SvgDocument，查询命令委托新的 DocumentViewVisitor；去掉 EditService/QueryService。DocumentService 保留文档和 IO 协调，不管理历史。
- EditorSession、CommandHistory、DocumentService、DocumentViewVisitor 直接放在 application；基础设施编解码与存储类合并到 infrastructure，仍一类一文件。
- Command/UndoableCommand 放在 commands；CommandDescriptor、执行结果和查询模型放在使用处，执行器和历史只导入命令契约。
- 历史保存命令及局部 ChangeSet，不默认复制全文；精确保存旧值、属性存在性、子树和位置，redo 重用记录。
- 失败原子性采用准备、校验、同步提交；undo/redo 成功才转移栈，IO 成功才更新会话和屏障。
- Visitor 生成只读查询投影和 SVG，accept 统一递归；CLI 单独排版，Iterable 隐藏孩子集合，DocumentStore 隔离 IO/XML。
- 集中创建使用简单工厂与静态命令注册，具体职责见架构方案。
- 采用 TDD，规划接收者、命令、执行器和端到端分层验证，尚未实施业务测试。
- 按名字分派仅在命令分发与图形工厂两处集中出现，并记录为未来重构项。
- 初期不实现插件、`box`、GUI，仅记录后续接入边界，不提前建立运行资源。

## 必须持续记住的约束

- 六种类型：`rect` / `circle` / `ellipse` / `line` / `text` / `g`；`box` 是后续阶段目标。
- id 全局唯一且大小写敏感；CLI 创建必须显式给 id，外部读入缺 id 才自动补齐并警告，且不能与已有 id 碰撞。
- 双引号保护含空格参数；只有整行开头的 `#` 是注释，不可吞掉颜色参数。
- `scale` 对全部几何属性（含位置）等比缩放；容器操作递归作用于子孙。
- `ungroup` 拒绝根级容器；分组禁止同时包含祖先与其子孙，移动归属不得形成环。
- 一条编辑命令是一个 undo 单元；新编辑清 redo。成功的 `init/read/save/canvas` 修改尺寸建立历史屏障，无参数 `canvas` 不建立屏障；查询不入栈。
- 错误统一为单行 `error:`；失败不改变模型、路径、历史或屏障。
- 省略 fill / stroke 就不写入该属性；text 内容是 XML 子文本。
- 开发应分步提交并推送；最终验收后再打并推送 `final` tag，不能提前标记完成。

## 实现前需收敛的问题

1. 跨父容器 `group` 的新父级和相对顺序基准，需求未完全定义。
2. 外部 SVG 的 `transform`、不支持元素及属性处理边界；不得静默丢失信息。需先明确支持范围与错误策略。
3. text 缩放在属性白名单下的语义；不擅自扩大 `set` 白名单。
4. save 显式路径是否成为默认路径、无文档时 help 是否可用、外部 SVG 的 viewBox 范围。
5. 需求示例计数与实际结构有差异，按树节点计数记录。

## 下一步建议顺序

1. 核对需求歧义并记录决策；选择运行环境与依赖，建立最小 TypeScript 工程和检查脚本。
2. 先写领域行为测试，再实现图形、文档树、局部变更和不变量；测试先行不等于本次已测试。
3. 实现命令和历史管理，再接入解析、REPL、SVG IO。
4. 按 `doc/README.md` 验收矩阵回放场景，补充边界测试和浏览器预览。
5. 填写实际架构、协作迭代、验证证据与一致性自查，完成最终提交与交付。

## 维护规则

每次完成一个实际工作阶段，更新当前状态、决策和剩余问题；对外提交说明维护在 `doc/README.md`。不在此保存凭据、私密配置或未经验证的完成结论。
