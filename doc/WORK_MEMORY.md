# 项目工作记忆

最后更新：2026-10-25。

## 事实来源与优先级

- 用户当前指令优先，其次遵循根目录 `AGENTS.md` 的协作约定。
- `phase_cli_1.md` 是课程需求原文；`doc/README.md` 的原架构设计描述自 2026-10-25 起冻结。若实际实现与设计存在冲突，只在本文件记录偏差和决策，不回写架构设计。
- 本文件记录已知事实、决策和下一步，不把计划写成已完成。

## 当前状态

- 初始化前仓库仅有 `phase_cli_1.md`；尚无源代码、依赖清单、运行脚本或测试。
- 已建立提交文档框架和拟定架构，以及 `.gitignore`、`.gitattributes`、`.editorconfig` 和根目录协作说明。
- 已选择 Node.js 24、pnpm 11.25、TypeScript 7 严格模式和 Vitest 5；项目已安装依赖并生成锁文件。尚未选择 XML 库。
- 仓库已有分步提交；当前阶段 5 改动尚未暂存、提交或推送，未创建 `final` tag。
- README 已记录阶段 2 的实际实现证据和验证结果；最终一致性自查结论仍留待完整验收。
- 按用户最新要求和课程第 1.2 节要求，完整项目文档已从根目录移至 `doc/README.md`，需求相对链接和协作约定已同步更新。
- 2026-10-25 已将工作区同步到 `origin/main` 的 `fe368ed`；同步后无差异，随后按该版本架构建立 `doc/DEVELOPMENT_PLAN.md`，记录 TDD 工作流程，并按顺序列出工程基线、最小链路、领域模型、结构编辑、命令历史、SVG IO、CLI 和验收阶段。该文件是计划，不代表业务功能已实现。
- 2026-10-25 已完成阶段一：建立 TypeScript 严格模式、Vitest、构建与启动脚本，创建模块目录和分层测试清单，固化 README 1.9 的实现边界。冒烟测试先失败、后通过；类型检查、测试、构建和启动均有实际记录，但尚无业务功能测试。
- `tests/README.md` 初版扩展为 127 项带 ID 的测试设计；阶段 4 复核后为 139 条，覆盖创建参数、属性白名单、Composite、树结构、局部变更、命令历史、文档与 SVG IO、CLI 和端到端验收；统一失败断言为 `FAIL-STATE`。
- 2026-10-25 已完成阶段 2：通过新增测试先确认缺失模块失败，再实现 `init -> create rect -> tree -> save` 的最小纵向链路。当前可按名称创建矩形、查询树、以显式或沿用路径保存 SVG；真实临时目录写入、失败保持状态、历史屏障、文档替换和构建产物 CLI 回放均有测试或执行证据。
- 阶段 2 新增 `Command` 体系、命令执行器与历史骨架、`EditorSession`、`DocumentService`、`SvgDocument`、`Rect`、查询/SVG Visitor、`DocumentStore` 适配器、分词与基础 REPL。尚未实现六种图形中的其余五种、Group、树结构编辑、undo/redo 命令和 read。
- 2026-10-25 完成阶段 2 架构审查与修复：用 `RectSpec` 隔离领域对象和 CLI token；拆分 `Command` 与 `UndoableCommand`；引入 Canvas/Shape/Saved/Help 语义结果和 `ShapeViewVisitor`；命令描述表同源生成 help；预期错误由 Guard 转换，未知错误不再泄漏实现消息并保留 cause。新增空数字和十六进制输入回归。
- 测试已从单一 `stage2.test.ts` 拆为 CLI、domain、application、integration、e2e 和 support 目录；目录重整后当前 8 个测试文件、10 个测试通过。`pnpm run check` 通过，真实 CLI 回放确认空字符串和十六进制数字被拒绝，文档、树和 help 输出正常。
- 2026-10-25 完成目录审查与修正：`application/commands` 分离 contracts/results/support；只读投影移入 `application/queries`；领域按 document/shapes/specs/visitor 分组；集成测试按失败状态、文档生命周期和 help 拆分；删除无行为价值的基线测试和非空目录 `.gitkeep`。`pnpm run check` 与构建产物 CLI 回放通过。
- 2026-10-25 完成阶段 3 领域模型与 Composite：新增 `Circle`、`Ellipse`、`Line`、`Text`、`ContainerShape`、`Group` 及对应类型化规格；`Shape` 统一封装 id、样式、父级、set/move/scale 契约；`Group` 递归平移/缩放，Visitor 支持组进入、递归、离开和子树跳过。
- `SvgDocument` 已用唯一 id 索引提供查找、父级查询和子树删除，元素计数包含嵌套节点；`create` 已通过集中类型映射支持六种内置图形，`tree` 与 `save` 已能递归输出组和全部叶子。阶段 3 结束时 `in`、group/ungroup/addto/front/back 尚未实现。
- 阶段 3 新增测试先因缺少图形类和命令类型分派失败；实现后领域、嵌套输出和六图形 CLI 链路测试通过。自查期间发现并修正了嵌套 SVG 根层多行缩进、移动溢出误用缩放错误文案及数值属性接受十六进制的问题。
- 阶段 3 最终 `pnpm run check` 通过：12 个测试文件、19 个测试，严格类型检查和生产构建均成功；构建产物管道回放创建六种图形并输出正确顺序的 tree。静态检查确认领域层未引用 CLI、Node 文件系统、XML 或基础设施，图形名分派仍只在命令类型映射和 `ShapeFactory`，新增生产类保持一类一文件。
- 2026-10-25 阶段 3 架构复审发现并修正四项隐患：公开 `appendChild/removeChild` 可绕过文档 id 索引；`Shape.set` 接收命令字符串；容器 move/scale 重复执行校验和修改；子树收集与只读视图存在重复遍历/重复状态。树变更改为仅供 `SvgDocument` 和容器协作者使用的 symbol 协议，属性修改改为类型化 `ShapeAttributeUpdate`，几何操作改为 `prepareMove/prepareScale` 与 `apply/revert` ChangeSet，子树收集复用 `ShapeCollector` Visitor，并移除 `ShapeView.type`。
- 架构修正后 `pnpm run check` 通过：13 个测试文件、22 个测试，严格类型检查和生产构建均成功；新增测试确认容器不存在普通 `appendChild/removeChild` API、文档删除保持 id 索引一致、属性更新不再解析命令字符串，以及已准备几何变更在 apply 前不修改状态并可精确 revert。
- 2026-10-25 已完成阶段 4：新增统一 `ChangeSet` 契约、插入/删除/重挂接/解组树变更、属性存在性快照和精确局部恢复；`SvgDocument` 在提交前计算最近公共祖先与目标位置，并集中维护树、父引用和 id 索引。CLI 已支持 `create ... in`、`group`、`ungroup`、`addto`、`front`、`back`。
- 阶段 4 测试先失败于缺失的结构准备 API 和命令，共 11 项预期失败；实现后新增领域、命令契约和 CLI 测试，覆盖跨父级分组、组内重排、解组原位替换、防环、空变更、删除/属性精确恢复以及命令 undo/redo。
- 阶段 4 自查期间修正了解组逆序恢复的索引依赖、命令在“变更已应用但结果构造失败”时的回滚窗口、缺失容器错误语义，以及 `front`/`back` 的 z-order 方向。最终 `pnpm run check` 通过：17 个测试文件、36 个测试，严格类型检查和生产构建成功。
- 构建产物回放成功执行嵌套创建、group、ungroup、addto、back/front，并输出父级和同级顺序正确的 tree；另一次空解组后继续引用已删除 id 的回放按规则输出 `error: no such shape`，未作为成功路径证据。
- 2026-10-25 完成测试条目复审与补全：清单共 139 条，当前 91 条通过、15 条部分通过、30 条待实现、3 条 N/A。补齐当前已实现能力的分发、执行器串行化、目标失败、同容器 `addto`、结构命令 undo/redo、CLI 引号/数字、会话与路径、保存替换失败、XML 转义、元素计数和架构守卫；未实现阶段能力保持明确未完成。
- 补测后发现并修正 `create ... in` 缺少容器 id 时的错误顺序，使命令在形状参数校验前返回 `create <type> requires a container after 'in'`。新增自动守卫确认领域无外部依赖、生产运行期导入无环、类文件名一致、分派集中、命令不直接改树，以及测试集无 skip/todo。
- 测试补全后 `pnpm run check` 通过：23 个测试文件、57 个测试，严格类型检查和生产构建成功。
- 2026-10-25 完成架构复审问题修复：删除公开的 `ShapeTreeMutation` symbol 写协议，图形对象只保留只读父子视图；文档私有 `ShapeTree` 维护 children、parent 和 id 索引，`ShapeStructurePlanner` 负责候选结构规划，`SvgDocument` 收缩为聚合根门面。
- 修复 create redo：redo 现在直接复用首次 `ShapeTreeChangeSet`，不再重建图形对象；新增对象身份回归。属性修改改为每类统一的 `ShapeAttributeSlot` 定义，移除每种图形三套平行 switch。
- 新增 `ChangeSetExecutor`：组合变更提交或恢复失败时尝试全部补偿动作，并用 `AggregateError` 同时保留提交错误和回滚错误。结构结果改为 `GroupCreatedResult`、`UngroupedResult`、`ShapeMovedIntoContainerResult`、`ShapeReorderedResult` 多态结果，不再使用可产生非法组合的通用结果数据袋。
- 命令参数规格拆为六个 Builder，类型名映射仍只存在于 `CommandDispatcher`；数字解析独立。构建脚本现在先清理 `dist`，防止已删除模块的旧产物残留。
- 架构修复后 `pnpm run check` 通过：23 个测试文件、58 个测试；构建产物确认 create redo 保持同一对象，旧 `ShapeTreeMutation.js` 不再生成。
- 2026-10-25 已完成阶段 5：新增 `delete`、`move`、`scale`、`set`、`undo`、`redo` 命令及多态结果，Dispatcher、Executor、Main 和测试装配共享同一 `CommandHistory`。每条成功且有状态变化的编辑命令作为一个撤销单元，新编辑清空 redo。
- 历史迁移采用“命令恢复成功后才移动栈元素”：undo/redo 结果失败或抛出异常时，文档、undo/redo 栈和屏障均保持操作前状态；IO 屏障后统一返回 `error: undo not allowed after io command`，空栈分别返回 `error: nothing to undo` / `error: nothing to redo`。
- 阶段 5 首轮目标测试先因 `move`/`undo` 未知和缺少 `redoCount` 失败；实现后目标测试通过。全量回归曾发现统一变更基类丢失 `hasChanges` 导致边界重排误报，已将实际变更标志重新传入多态结果并再次通过回归。
- 阶段 5 代码复查发现并修复：结果类型上编辑方向命名与 z-order 方向冲突；样式更新仍按属性名 `switch`；撤销历史取栈顶使用类型断言；未执行命令与快照取值缺少显式约束。现在样式通过类型化 `withFill`/`withStroke`/`withStrokeWidth` 修改，剩余 `switch` 仅处理命令类别、图形工厂规格类型和结果值自身枚举。
- 阶段 5 架构复审进一步修正了四项结构债务：`CommandHistory` 改为 Dispatcher 的强制依赖，消除 Dispatcher 与 Executor 静默持有不同历史的可能；`CreateShapeCommand` 改由 `EditChangeSetCommand` 提供统一事务流程；Dispatcher 不再承载参数解析和具体命令构造，拆出文档、创建、图形编辑、结构编辑、历史和查询六个命令工厂；`ShapeAttributeUpdate` 与属性槽统一使用 `ShapeAttributeValueKind`，不再保留并行字符串协议。
- 架构拆分后 `CommandDispatcher` 为 151 行，只负责定义表、名称查找和 help；最大命令工厂 82 行。新增源码守卫禁止 Dispatcher 默认构造历史、直接实例化具体编辑命令，并固定创建命令与属性种类的统一契约。
- 阶段 5 最终 `pnpm run check` 通过：24 个测试文件、64 个测试，严格类型检查和生产构建成功。构建产物回放通过 Composite 移动与 undo、文本 set、子树 delete 与 undo/redo，输出与树状态一致。
- exFAT 不支持符号链接，pnpm 项目配置使用 hoisted 布局；`.npmrc` 与 `pnpm-workspace.yaml` 中保留了该平台设置。

## 实际实现架构

本节是实际实现架构的唯一演进记录。后续目录、职责和依赖调整只更新本节，不改写 `doc/README.md` 的原架构设计。

- `src/cli/`：命令分词、REPL、结果排版和 CLI 语法错误。
- `src/application/`：命令分发、串行执行、历史、会话和文档协调；`CommandDispatcher` 只维护集中名称定义表与 help，具体参数解释和构造由命令工厂承担。
- `src/application/commands/contracts/`：Command、UndoableCommand、ShapeSpecBuilder、命令类别（含独立 History 类别）、结果及结果 Visitor 契约。
- `src/application/commands/results/`：Canvas、Shape、编辑方向、多态 Structure、Saved、Error、Help 和 Tree 语义结果；每类结构结果只允许合法字段组合。
- `src/application/commands/support/`：预期命令错误转换。
- `src/application/commands/factories/`：按文档、创建、图形编辑、结构编辑、历史和查询拆分命令参数解析与构造；Dispatcher 注入的同一 `CommandHistory` 被强制传给历史命令工厂。
- `src/application/commands/`：内置具体命令保持平铺；`EditChangeSetCommand` 为局部变更命令提供准备、提交、撤销、重做和失败反向恢复，`TreeEditCommand` 在此之上约束结构变更；`specs/` 用六个 Builder 隔离参数规格，命令名到 Builder 的映射仍集中在 `CommandDispatcher`。
- `src/application/queries/`：六种图形的只读投影、组投影和访问者。
- `src/application/queries/` 同时提供统一 `ShapeAnchorProjector`，只读投影图形位置摘要；展示文案仍只由 `OutputFormatter` 生成。
- `src/application/ports/`：文档存储及端口错误。
- `src/domain/document/`：`SvgDocument` 聚合根；私有 `ShapeTree` 维护根顺序、父级、children 与 id 索引；`ShapeStructurePlanner` 负责结构候选校验和 ChangeSet 规划。
- `src/domain/shapes/`：`Shape`、`ContainerShape`/`Group`、六种叶子图形、不可变 `ShapeStyle`、`ShapeAttributeSlot`、类型化属性/几何快照和局部树变更。图形不暴露父级、子级或树对象写入口。
- `src/domain/specs/`：类型化创建规格，禁止外部 token 进入领域。
- `src/domain/visitor/`：领域遍历契约和复用该契约的 `ShapeCollector`。
- `src/infrastructure/`：SVG 序列化、原子文件存储和 Node.js IO 适配。
- `src/bootstrap/`：生产对象装配与 CLI 入口。
- `scripts/`：构建前清理 `dist`，防止已删除模块残留。
- 依赖方向保持为 `bootstrap -> cli/infrastructure/application -> domain`；领域不依赖终端、文件系统、XML 或基础设施。
- 名字分派只允许位于 `CommandDispatcher` 和 `ShapeFactory`，跨调用传入类型化对象而不是隐式字符串协议。
- 测试按 `domain`、`application`、`cli`、`integration`、`e2e` 和 `support` 组织，不按开发阶段命名。

## 已定方案与实现进展

- 采用 TypeScript、面向对象、一类一文件；Command 已用于现有编辑/查询命令，Composite 已由 `ContainerShape` 和 `Group` 落地统一几何/属性操作。
- 模块：`cli`、`application`（commands 内部再分 contracts/results/support，查询投影独立为 queries）、`domain`（document/shapes/specs/visitor）、`infrastructure`、`bootstrap`，具体职责和依赖见提交文档。
- 架构方案已完成模式选型与职责细化，依据项目需求说明取舍。
- AI 协作记录仅保留关键决策，已补充本次目录压平及去除纯转发层的讨论。
- 文档已合并重复说明，依次描述模块、模式、执行、历史和扩展；PlantUML 保留竖向布局及 application 内部组件，节点仅显示名称，用低饱和配色区分层次，省略连线文字及重复契约依赖。
- 用户明确未来新增命令、GUI、VS Code / DeepSeek harness 等宿主集成方向；README 1.8 记录演进边界，尚无业务实现。
- 按用户最新要求，本阶段不预留或实现 EditorApi、通用请求协议、describeCommands；仅 CLI，未来 GUI/宿主需求未定，提前固定接口缺少验收依据并增加维护成本。原因见 README 1.8。
- CLI 委托 CommandDispatcher 创建命令、CommandExecutor 串行执行；命令契约移至 commands，help 与静态描述符同源。未来第二入口出现后再提取应用接口。
- 区分宿主集成和动态扩展；GUI 手势事务、提交订阅、宿主历史/存储适配及进程桥接均留后续，不预设具体 SDK/协议。
- 封闭 Visitor 适用于当前六类型；任意新图形须复评投影/序列化契约，不承诺插件零修改。
- 编辑命令直接绑定当前 SvgDocument，查询命令委托新的 DocumentViewVisitor；去掉 EditService/QueryService。DocumentService 保留文档和 IO 协调，不管理历史。
- EditorSession、CommandHistory、DocumentService 和命令执行协调直接放在 application；查询模型与访问者放在 queries；基础设施编解码与存储类合并到 infrastructure，仍一类一文件。
- Command/UndoableCommand 等契约放在 commands/contracts，语义结果放在 commands/results；执行器和历史只导入命令契约。
- 历史保存命令及局部 ChangeSet，不默认复制全文；精确保存旧值、属性存在性、子树和位置，redo 重用记录。
- 失败原子性采用准备、校验、同步提交；undo/redo 成功才转移栈，IO 成功才更新会话和屏障。
- Visitor 生成只读查询投影和 SVG，accept 统一递归；CLI 单独排版，Iterable 隐藏孩子集合，DocumentStore 隔离 IO/XML。
- 集中创建使用简单工厂与静态命令注册，具体职责见架构方案。
- 采用 TDD；阶段 2 已实施命令、执行器、真实 IO 和 CLI 边界的首批业务测试。
- 按名字分派仅在命令分发与图形工厂两处集中出现，并记录为未来重构项。
- 初期不实现插件、`box`、GUI，仅记录后续接入边界，不提前建立运行资源。

## 必须持续记住的约束

- 六种类型：`rect` / `circle` / `ellipse` / `line` / `text` / `g` 已实现领域建模与创建；`box` 是后续阶段目标。
- id 全局唯一且大小写敏感；CLI 创建必须显式给 id，外部读入缺 id 才自动补齐并警告，且不能与已有 id 碰撞。
- 双引号保护含空格参数；只有整行开头的 `#` 是注释，不可吞掉颜色参数。
- `scale` 对全部几何属性（含位置）等比缩放；容器操作递归作用于子孙。
- `ungroup` 拒绝根级容器；分组禁止同时包含祖先与其子孙，移动归属不得形成环。
- 一条编辑命令是一个 undo 单元；新编辑清 redo。成功的 `init/read/save/canvas` 修改尺寸建立历史屏障，无参数 `canvas` 不建立屏障；查询不入栈。
- 错误统一为单行 `error:`；失败不改变模型、路径、历史或屏障。
- 省略 fill / stroke 就不写入该属性；text 内容是 XML 子文本。
- 阶段完成后先等待用户检查代码，不自动暂存、提交或推送；提交信息由用户编写。只有用户明确确认检查完成并要求推送后，才可推送。最终验收后再打并推送 `final` tag，不能提前标记完成。

## 已确定的实现边界

跨父容器 `group`、外部 SVG 支持范围、不支持内容、`viewBox`、`text` 缩放、保存路径、无文档 `help` 和元素计数规则已在冻结的 `doc/README.md` 1.9 中记录。后续实现偏差和新决策只补充到工作记忆；需求原文不变。

测试清单还标出了需求未规定、实现前必须固定的细节：非法尺寸与数值范围、group 目标异常文案、addto 成环文案、front/back 边界是否入栈、空栈 undo/redo 行为、最终文件替换失败的可保证范围。实现相应功能前先在本文件记录实际决定。

阶段 3 已固定的补充边界：

- `fill` / `stroke` 必须为非空文本；`stroke-width` 必须是非负有限十进制数；各尺寸属性必须为正。`set` 白名单外的属性由具体图形拒绝。
- 图形移动或缩放先对全部受影响节点计算并检查有限值，再同步提交；失败不修改任何几何。普通 `g` 的 `set` 只改组自身样式，不传播给子节点。
- `SvgDocument.deleteShape` 删除完整子树并从 id 索引移除；被删除子树内部保留父子引用，供后续局部变更记录和 undo 恢复使用，顶层被删节点与原父级断开。
- 阶段 3 的 `SvgDocument.createShape(spec, parent?)` 已提供受控父级参数并校验父容器属于当前文档；当时的 CLI `in` 语法、跨父级收编和顺序调整尚未实现，现已在阶段 4 完成。
- 普通应用代码不能修改容器 children 或形状 parent；这些状态只存于 `SvgDocument` 私有的 `ShapeTree`，`Shape`/`ContainerShape` 仅提供只读查询。公开的树写 symbol 协议已删除。
- `Shape.set` 只接收 `ShapeAttributeUpdate`，数值和文本在创建更新值时已定型；领域不再解析 CLI/十六进制等外部数字语法。`move/scale` 先生成包含精确 before/after 的 `GeometryChangeSet`，再由公共入口原子应用。

阶段 4 已固定的补充边界：

- `create ... in <id>` 的目标必须是当前文档中的容器；不存在返回 `no such container`，叶子目标返回 `not a container`，新节点追加为该容器最后一个子节点。
- `group` 至少需要两个目标；新组挂到所有目标的最近公共祖先末尾，组内严格按命令参数顺序排列。重复目标返回 `duplicate group target: <id>`，目标过少返回 `group requires at least two shapes`，祖先与子孙同时选择返回 `cannot group a container into its own descendant: <id>`。
- `ungroup` 只接受非根级普通 `Group`；子节点按原顺序替换容器位置，根级目标被拒绝，叶子目标返回容器类型错误。后续复合图形启用时另行定义其拒绝语义。
- `addto` 先校验目标容器再校验源图形；移动到自身或后代返回 `cannot move a container into its own descendant: <id>`。源图形已在目标容器末尾时为空变更。
- `front` 表示同级 z-order 最后（数组末尾），`back` 表示同级最前（数组开头）；已位于对应边界时返回确定性结果、空 ChangeSet，且不进入 undo 栈。
- 结构命令先准备完整 ChangeSet 再同步提交；失败目标不改变树、父引用、id 索引或历史。命令在结果构造失败时回滚已提交 ChangeSet。
- 组合 ChangeSet 的提交、恢复和内部补偿都必须尝试全部动作；回滚或补偿失败与原始异常一起通过 `AggregateError` 报告。
- create redo 必须复用首次 ChangeSet 和同一 Shape 对象；结构命令继续复用共享 `TreeEditCommand` 记录。

阶段 5 已固定的补充边界：

- 任一依赖图形的编辑命令先要求当前文档存在；无文档时 `undo`/`redo` 与其他命令一样返回 `error: no document. use 'init' or 'read' first`，只有 `help` 例外。
- `undo` 和 `redo` 成功后移动栈元素，不进入编辑历史；新编辑成功记录时清空 redo。查询不改变历史，IO 屏障在成功文档命令之后建立，下一次成功编辑解除屏障。
- 空栈 undo/redo 分别返回 `error: nothing to undo` / `error: nothing to redo`；屏障期间两者统一返回 `error: undo not allowed after io command`。
- `move 0 0`、`scale 1` 和 `set` 到相同值属于成功但不改变状态的操作，不制造空历史单元，也不清除已有 redo。
- 撤销或重做恢复成功但结果构造失败时，命令先反向恢复状态再返回失败；未知异常由执行器统一输出 `error: command failed`，不泄漏实现信息。
- `delete` 记录被删节点的类型和原父级，undo 在可能时显示恢复到的容器；移动/缩放通过 Visitor 投影位置，不在命令层拼接输出文案。

## 下一步建议顺序

1. 进入 `doc/DEVELOPMENT_PLAN.md` 阶段 6：实现 SVG 读取、缺 id 警告、候选文档校验和原子替换。
2. 补齐无参数 `save` 的读取路径、`canvas` 查询/修改及文档命令的完整历史屏障验证。
3. 进入阶段 7，补 `tree <id>`、`show` 和最终完整 CLI。
4. 按 `doc/README.md` 验收矩阵回放完整场景并做浏览器预览，最后填写一致性自查；只有用户确认后才提交和推送。

## 维护规则

每次完成一个实际工作阶段，更新当前状态、实际实现架构、决策和剩余问题。`doc/README.md` 仅保留冻结的原架构设计和允许补充的结果记录；不在此保存凭据、私密配置或未经验证的完成结论。
