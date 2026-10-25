# 项目工作记忆

## 事实来源与优先级

- 用户当前指令优先，其次遵循根目录 `AGENTS.md` 的协作约定。
- `phase_cli_1.md` 是课程需求原文；用户明确要求整理最终提交 README，已据此更新文档。后续实现偏差仍在本文件记录；README 维护须区分方案和实际调整，不回溯虚构设计过程。
- 本文件记录已知事实、决策和下一步，不把计划写成已完成。

## 当前状态

- 最终提交文档已按用户要求整理，README 包含架构方案、过程记录、一致性自查和质量保证手段；项目维护文档中的日期标记已移除。Git 交付仍等待用户检查及明确指令。
- 初始化前仓库仅有 `phase_cli_1.md`；以下保留逐步开发的历史事实，阶段能力以阶段 8 验收记录为准。
- 已建立提交文档框架和拟定架构，以及 `.gitignore`、`.gitattributes`、`.editorconfig` 和根目录协作说明。
- 已选择 Node.js 24、pnpm 11.25、TypeScript 7 严格模式、Vitest 5 和 saxes XML 解析库；项目已安装依赖并生成锁文件。
- 本轮开始时阶段 7 与简化重构已提交为 `8439b03`，工作区干净；阶段 8 改动未暂存、提交或推送，未创建 `final` tag。
- README 已记录阶段 2 的实际实现证据和验证结果；最终一致性自查结论仍留待完整验收。
- 按用户最新要求和课程第 1.2 节要求，完整项目文档已从根目录移至 `doc/README.md`，需求相对链接和协作约定已同步更新。
- 已将工作区同步到 `origin/main` 的 `fe368ed`；同步后无差异，随后按该版本架构建立 `doc/DEVELOPMENT_PLAN.md`，记录 TDD 工作流程，并按顺序列出工程基线、最小链路、领域模型、结构编辑、命令历史、SVG IO、CLI 和验收阶段。该文件是计划，不代表业务功能已实现。
- 已完成阶段一：建立 TypeScript 严格模式、Vitest、构建与启动脚本，创建模块目录和分层测试清单，固化 README 1.9 的实现边界。冒烟测试先失败、后通过；类型检查、测试、构建和启动均有实际记录，但尚无业务功能测试。
- `tests/README.md` 初版扩展为 127 项带 ID 的测试设计；阶段 4 复核后为 139 条，覆盖创建参数、属性白名单、Composite、树结构、局部变更、命令历史、文档与 SVG IO、CLI 和端到端验收；统一失败断言为 `FAIL-STATE`。
- 已完成阶段 2：通过新增测试先确认缺失模块失败，再实现 `init -> create rect -> tree -> save` 的最小纵向链路。当前可按名称创建矩形、查询树、以显式或沿用路径保存 SVG；真实临时目录写入、失败保持状态、历史屏障、文档替换和构建产物 CLI 回放均有测试或执行证据。
- 阶段 2 新增 `Command` 体系、命令执行器与历史骨架、`EditorSession`、`DocumentService`、`SvgDocument`、`Rect`、查询/SVG Visitor、`DocumentStore` 适配器、分词与基础 REPL。尚未实现六种图形中的其余五种、Group、树结构编辑、undo/redo 命令和 read。
- 完成阶段 2 架构审查与修复：用 `RectSpec` 隔离领域对象和 CLI token；拆分 `Command` 与 `UndoableCommand`；引入 Canvas/Shape/Saved/Help 语义结果和 `ShapeViewVisitor`；命令描述表同源生成 help；预期错误由 Guard 转换，未知错误不再泄漏实现消息并保留 cause。新增空数字和十六进制输入回归。
- 测试已从单一 `stage2.test.ts` 拆为 CLI、domain、application、integration、e2e 和 support 目录；目录重整后当前 8 个测试文件、10 个测试通过。`pnpm run check` 通过，真实 CLI 回放确认空字符串和十六进制数字被拒绝，文档、树和 help 输出正常。
- 完成目录审查与修正：`application/commands` 分离 contracts/results/support；只读投影移入 `application/queries`；领域按 document/shapes/specs/visitor 分组；集成测试按失败状态、文档生命周期和 help 拆分；删除无行为价值的基线测试和非空目录 `.gitkeep`。`pnpm run check` 与构建产物 CLI 回放通过。
- 完成阶段 3 领域模型与 Composite：新增 `Circle`、`Ellipse`、`Line`、`Text`、`ContainerShape`、`Group` 及对应类型化规格；`Shape` 统一封装 id、样式、父级、set/move/scale 契约；`Group` 递归平移/缩放，Visitor 支持组进入、递归、离开和子树跳过。
- `SvgDocument` 已用唯一 id 索引提供查找、父级查询和子树删除，元素计数包含嵌套节点；`create` 已通过集中类型映射支持六种内置图形，`tree` 与 `save` 已能递归输出组和全部叶子。阶段 3 结束时 `in`、group/ungroup/addto/front/back 尚未实现。
- 阶段 3 新增测试先因缺少图形类和命令类型分派失败；实现后领域、嵌套输出和六图形 CLI 链路测试通过。自查期间发现并修正了嵌套 SVG 根层多行缩进、移动溢出误用缩放错误文案及数值属性接受十六进制的问题。
- 阶段 3 最终 `pnpm run check` 通过：12 个测试文件、19 个测试，严格类型检查和生产构建均成功；构建产物管道回放创建六种图形并输出正确顺序的 tree。静态检查确认领域层未引用 CLI、Node 文件系统、XML 或基础设施，图形名分派仍只在命令类型映射和 `ShapeFactory`，新增生产类保持一类一文件。
- 阶段 3 架构复审发现并修正四项隐患：公开 `appendChild/removeChild` 可绕过文档 id 索引；`Shape.set` 接收命令字符串；容器 move/scale 重复执行校验和修改；子树收集与只读视图存在重复遍历/重复状态。树变更改为仅供 `SvgDocument` 和容器协作者使用的 symbol 协议，属性修改改为类型化 `ShapeAttributeUpdate`，几何操作改为 `prepareMove/prepareScale` 与 `apply/revert` ChangeSet，子树收集复用 `ShapeCollector` Visitor，并移除 `ShapeView.type`。
- 架构修正后 `pnpm run check` 通过：13 个测试文件、22 个测试，严格类型检查和生产构建均成功；新增测试确认容器不存在普通 `appendChild/removeChild` API、文档删除保持 id 索引一致、属性更新不再解析命令字符串，以及已准备几何变更在 apply 前不修改状态并可精确 revert。
- 已完成阶段 4：新增统一 `ChangeSet` 契约、插入/删除/重挂接/解组树变更、属性存在性快照和精确局部恢复；`SvgDocument` 在提交前计算最近公共祖先与目标位置，并集中维护树、父引用和 id 索引。CLI 已支持 `create ... in`、`group`、`ungroup`、`addto`、`front`、`back`。
- 阶段 4 测试先失败于缺失的结构准备 API 和命令，共 11 项预期失败；实现后新增领域、命令契约和 CLI 测试，覆盖跨父级分组、组内重排、解组原位替换、防环、空变更、删除/属性精确恢复以及命令 undo/redo。
- 阶段 4 自查期间修正了解组逆序恢复的索引依赖、命令在“变更已应用但结果构造失败”时的回滚窗口、缺失容器错误语义，以及 `front`/`back` 的 z-order 方向。最终 `pnpm run check` 通过：17 个测试文件、36 个测试，严格类型检查和生产构建成功。
- 构建产物回放成功执行嵌套创建、group、ungroup、addto、back/front，并输出父级和同级顺序正确的 tree；另一次空解组后继续引用已删除 id 的回放按规则输出 `error: no such shape`，未作为成功路径证据。
- 完成测试条目复审与补全：清单共 139 条，当前 91 条通过、15 条部分通过、30 条待实现、3 条 N/A。补齐当前已实现能力的分发、执行器串行化、目标失败、同容器 `addto`、结构命令 undo/redo、CLI 引号/数字、会话与路径、保存替换失败、XML 转义、元素计数和架构守卫；未实现阶段能力保持明确未完成。
- 补测后发现并修正 `create ... in` 缺少容器 id 时的错误顺序，使命令在形状参数校验前返回 `create <type> requires a container after 'in'`。新增自动守卫确认领域无外部依赖、生产运行期导入无环、类文件名一致、分派集中、命令不直接改树，以及测试集无 skip/todo。
- 测试补全后 `pnpm run check` 通过：23 个测试文件、57 个测试，严格类型检查和生产构建成功。
- 完成架构复审问题修复：删除公开的 `ShapeTreeMutation` symbol 写协议，图形对象只保留只读父子视图；文档私有 `ShapeTree` 维护 children、parent 和 id 索引，`ShapeStructurePlanner` 负责候选结构规划，`SvgDocument` 收缩为聚合根门面。
- 修复 create redo：redo 现在直接复用首次 `ShapeTreeChangeSet`，不再重建图形对象；新增对象身份回归。属性修改改为每类统一的 `ShapeAttributeSlot` 定义，移除每种图形三套平行 switch。
- 新增 `ChangeSetExecutor`：组合变更提交或恢复失败时尝试全部补偿动作，并用 `AggregateError` 同时保留提交错误和回滚错误。结构结果改为 `GroupCreatedResult`、`UngroupedResult`、`ShapeMovedIntoContainerResult`、`ShapeReorderedResult` 多态结果，不再使用可产生非法组合的通用结果数据袋。
- 命令参数规格拆为六个 Builder，类型名映射仍只存在于 `CommandDispatcher`；数字解析独立。构建脚本现在先清理 `dist`，防止已删除模块的旧产物残留。
- 架构修复后 `pnpm run check` 通过：23 个测试文件、58 个测试；构建产物确认 create redo 保持同一对象，旧 `ShapeTreeMutation.js` 不再生成。
- 已完成阶段 5：新增 `delete`、`move`、`scale`、`set`、`undo`、`redo` 命令及多态结果，Dispatcher、Executor、Main 和测试装配共享同一 `CommandHistory`。每条成功且有状态变化的编辑命令作为一个撤销单元，新编辑清空 redo。
- 历史迁移采用“命令恢复成功后才移动栈元素”：undo/redo 结果失败或抛出异常时，文档、undo/redo 栈和屏障均保持操作前状态；IO 屏障后统一返回 `error: undo not allowed after io command`，空栈分别返回 `error: nothing to undo` / `error: nothing to redo`。
- 阶段 5 首轮目标测试先因 `move`/`undo` 未知和缺少 `redoCount` 失败；实现后目标测试通过。全量回归曾发现统一变更基类丢失 `hasChanges` 导致边界重排误报，已将实际变更标志重新传入多态结果并再次通过回归。
- 阶段 5 代码复查发现并修复：结果类型上编辑方向命名与 z-order 方向冲突；样式更新仍按属性名 `switch`；撤销历史取栈顶使用类型断言；未执行命令与快照取值缺少显式约束。现在样式通过类型化 `withFill`/`withStroke`/`withStrokeWidth` 修改，剩余 `switch` 仅处理命令类别、图形工厂规格类型和结果值自身枚举。
- 阶段 5 架构复审进一步修正了四项结构债务：`CommandHistory` 改为 Dispatcher 的强制依赖，消除 Dispatcher 与 Executor 静默持有不同历史的可能；`CreateShapeCommand` 改由 `EditChangeSetCommand` 提供统一事务流程；Dispatcher 不再承载参数解析和具体命令构造，拆出文档、创建、图形编辑、结构编辑、历史和查询六个命令工厂；`ShapeAttributeUpdate` 与属性槽统一使用 `ShapeAttributeValueKind`，不再保留并行字符串协议。
- 架构拆分后 `CommandDispatcher` 为 151 行，只负责定义表、名称查找和 help；最大命令工厂 82 行。新增源码守卫禁止 Dispatcher 默认构造历史、直接实例化具体编辑命令，并固定创建命令与属性种类的统一契约。
- 阶段 5 最终 `pnpm run check` 通过：24 个测试文件、64 个测试，严格类型检查和生产构建成功。构建产物回放通过 Composite 移动与 undo、文本 set、子树 delete 与 undo/redo，输出与树状态一致。
- 已完成阶段 6：新增 `read`、无参数 `save` 和 `canvas` 查询/修改；SVG 读取使用 `saxes@6.0.0` 严格解析，支持六种内置图形、嵌套 `g`、命名空间、注释、实体、文本和公共样式属性，并在成功替换会话后输出缺 id 警告。
- 阶段 6 目标测试先因缺少 `SvgReader` 失败；实现后读取、缺 id 冲突规避、重复 id、未知元素/属性、`transform`/`style`/`class`、DOCTYPE、非法 XML、命名空间、viewBox、缺省样式、默认路径、失败原子性和 canvas 历史屏障均通过。
- 阶段 6 新增 `CanvasSize` 维护画布宽高不变量；`DocumentService.read` 只接收已完成的候选文档，成功后一次性替换会话和默认路径。端口返回 `LoadedDocument`/`ImportedShapeId`，命令层再映射为独立结果模型，避免 `commands/results -> ports` 依赖。
- 阶段 6 风格与漏洞复查发现并修正两点：解析器原先使用 `instanceof` 分支处理文本/容器，改为节点多态的子节点与文本接收契约；读取结果集合补齐防御性复制。XML 解析拒绝 DOCTYPE 和处理指令，不加载外部实体，所有不支持的 SVG 内容显式失败而不是静默丢弃。
- 阶段 6 最终 `pnpm run check` 通过：26 个测试文件、78 个测试，严格类型检查和生产构建成功。构建产物完成 `create -> save -> read -> tree -> canvas -> save -> read` 回放，尺寸、嵌套结构、样式和文本 round-trip 正确；`pnpm audit --prod` 报告 `No known vulnerabilities found`，`saxes` 实际版本为 6.0.0。
- 已完成阶段 7：新增 `tree [id]`、`show <id>` 和完整 `help`，查询命令通过 `DocumentViewVisitor` 生成全树、子树或单图形明细；交互式 stdin 显示 `svg>` 提示，管道与自动化流保持无提示符的逐行回放。
- 阶段 7 新测试先因 `tree <id>` 被拒绝、`show` 未注册而失败；实现后覆盖六种图形明细、根级与嵌套父级、未知 id、参数错误、查询不入历史、无文档边界和交互提示符。
- 阶段 7 风格与漏洞复查发现并修正三项问题：15 字符图形标签会与首个属性粘连，现改为固定列宽且至少保留一个分隔；父级摘要曾在应用查询模型 `ShapeReference.toString()` 中拼接 CLI 文案，现由 `ShowFormatter` 独占展示格式；查询命令最初未经过执行守卫，未知 id 被包装为 `command failed`，现与其他命令一致返回具体单行错误。
- 阶段 7 最终 `pnpm run check` 通过：27 个测试文件、82 个测试，严格类型检查和生产构建成功。构建产物回放验证全树、子树、六类 `show` 明细及未知 id；真实 TTY 回放确认启动提示、输入回显和连续 `svg>` 提示正常；`pnpm audit --prod` 报告 `No known vulnerabilities found`。
- 完成全仓架构与 OOP 复查：未发现上帝类、贫血领域模型、层级反向依赖或按图形名称散落 `switch`；最大生产类为 252 行的 `ShapeStructurePlanner`，职责仍集中在结构变更规划。主要隐患是局部命令构造时序、结果语义、方向条件分派、明细查询过度遍历和守卫覆盖不足，均已在同轮修正。
- 架构复查修正了以下问题：`front`/`back` 基类不再按方向字符串条件分派，由具体命令分别实现；移动/缩放结果准确反映空操作；删除、移动、缩放和设置命令不在构造期读取可变文档；单图形几何写入失败会回滚已应用值；`show <g>` 使用不进入子节点的明细 Visitor；移除 `SvgDocument.removeShape` 纯转发别名和无用导入。
- 架构守卫已扩展到分层依赖、全部生产类声明、命令绕过 ChangeSet 检查、零变化结果、命令构造边界和明细根节点投影；`tsconfig` 开启 `noUnusedLocals`、`noUnusedParameters` 和 `noImplicitReturns`。复查后 `pnpm run check` 通过：28 个测试文件、86 个测试，严格类型检查和生产构建成功。
- 仍有明确阶段边界风险：六种图形仍由封闭的领域/查询 Visitor 和多处注册表共同覆盖，新增 `box` 或插件类型必须协调修改这些扩展点；深层 SVG 的读取、查询和保存仍使用递归遍历与逐层缩进，极端嵌套下存在栈深和输出体积膨胀风险。这两项不影响当前六种内置图形的正确性，但插件化或处理不可信超大文件前必须重新评估。
- exFAT 不支持符号链接，pnpm 项目配置使用 hoisted 布局；`.npmrc` 与 `pnpm-workspace.yaml` 中保留了该平台设置。

## 实际实现架构

本节是实际实现架构的唯一演进记录。后续目录、职责和依赖调整只更新本节，不改写 `doc/README.md` 的原架构设计。

- `src/cli/`：命令分词、REPL、结果排版和 CLI 语法错误。
- `src/application/`：命令分发、串行执行、历史、会话和文档协调；`CommandDispatcher` 维护集中名称定义表与 help，并直接创建参数简单的结构、历史和查询命令。文档参数与数值/属性解码仍由有实际解析职责的工厂承担。
- `src/application/commands/contracts/`：Command、UndoableCommand、ShapeSpecBuilder、命令类别（含独立 History 类别）、编辑/重排方向、结果及结果 Visitor 契约。
- `src/application/commands/results/`：Canvas 查询/创建/调整、文档读取/保存、Shape、编辑方向、多态 Structure、Error、Help、全树、子树和 Shape 明细语义结果；每类结果只允许合法字段组合。
- `src/application/commands/support/`：预期命令错误转换。
- `src/application/commands/factories/`：保留 `CreateShapeCommandFactory`、`DocumentCommandFactory`、`ShapeEditCommandFactory`，负责图形规格、画布参数和数值/属性更新的解码；删除结构、历史和查询三类薄工厂。Dispatcher 直接将注入的同一 `CommandHistory` 传给 undo/redo 命令。
- `src/application/commands/`：内置具体命令保持平铺；`EditChangeSetCommand` 为局部变更命令提供准备、提交、撤销、重做和失败反向恢复，结构命令直接继承该基类，删除无独立行为的 `TreeEditCommand`；`specs/` 用六个 Builder 隔离参数规格，`CreateShapeCommandFactory` 集中维护 `create` 子命令的图形类型到 Builder 映射。
- `src/application/queries/`：统一不可变 `ShapeSnapshot`、`GeometrySnapshot` 与 `DocumentView`；`ShapeReference` 保存类型/id，`ShapeAnchor` 保存坐标。只有 `DocumentViewVisitor` 负责从领域对象投影，支持全树、子树和不访问子节点的 `inspect`；move/scale 的位置摘要复用该投影。删除六种 View 子类、`ShapeView`、`ShapeViewVisitor`、独立明细包装与 Visitor、位置摘要 Visitor。
- `GeometrySnapshot` 使用封闭的几何属性名类型、数值元组及明确的线段/文本工厂，保存语义数据，不包含 CLI 文案。查询快照不是可写领域模型；集合复制并冻结，领域行为仍由 Shape/Composite 承担。
- `src/cli/` 的 `ShapeFormatter` 直接排版查询快照，共用于 `TreeFormatter` 和 `ShowFormatter`；删除 `ShapeDescription` 及其 Visitor，不再复制一层展示模型，也不按图形名字重新分派。宽高缩写、坐标括号、父级摘要等文案只存在于 CLI。
- `src/application/ports/`：定义 `DocumentStore`、`LoadedDocument`、`ImportedShapeId` 和读写错误；导入元数据由读取适配器产生，命令映射为自己的结果模型，不把基础设施细节带入命令结果。
- `src/domain/document/`：`SvgDocument` 聚合根；私有 `ShapeTree` 维护根顺序、父级、children 与 id 索引；`ShapeStructurePlanner` 负责结构候选校验和 ChangeSet 规划。
- `src/domain/document/CanvasSize`：封装正有限宽高约束；`SvgDocument` 通过整体替换尺寸对象调整画布。
- `src/domain/shapes/`：`Shape`、`ContainerShape`/`Group`、五种叶子图形、不可变 `ShapeStyle`、`ShapeAttributeSlot`、类型化属性/几何记录和局部树变更。图形不暴露父级、子级或树对象写入口。`CompositeChangeSet` 在 domain 根目录统一组合执行、恢复与空变更判断；几何集合仅保留构造单图形记录的便利工厂，树与属性集合不再保留平行类。
- `src/domain/specs/`：类型化创建规格，禁止外部 token 进入领域。
- `src/domain/visitor/`：领域遍历契约和复用该契约的 `ShapeCollector`。
- `src/infrastructure/`：SVG 序列化、严格 SVG/XML 解析、原子文件存储和 Node.js IO 适配。`SvgTreeParser` 用 `saxes` 构建基础设施解析树，`SvgElementFactory` 集中完成 SVG 标签到解析节点的映射；该映射是图形工厂在读取方向的唯一集中分派点，不向领域传入 XML 语法。
- `src/bootstrap/`：生产对象装配与 CLI 入口。
- `scripts/`：构建前清理 `dist`，防止已删除模块残留。
- 依赖方向保持为 `bootstrap -> cli/infrastructure/application -> domain`；领域不依赖终端、文件系统、XML 或基础设施。
- 名字分派只允许位于 `CommandDispatcher`、领域 `ShapeFactory` 和基础设施 `SvgElementFactory`：分别负责命令名、类型化规格名和 SVG 标签名；跨调用传入类型化对象而不是隐式字符串协议，其他位置不得新增名称 switch。
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
- create redo 必须复用首次 ChangeSet 和同一 Shape 对象；阶段 4 时结构命令复用共享 `TreeEditCommand` 记录；本轮简化后直接复用 `EditChangeSetCommand`。

阶段 5 已固定的补充边界：

- 任一依赖图形的编辑命令先要求当前文档存在；无文档时 `undo`/`redo` 与其他命令一样返回 `error: no document. use 'init' or 'read' first`，只有 `help` 例外。
- `undo` 和 `redo` 成功后移动栈元素，不进入编辑历史；新编辑成功记录时清空 redo。查询不改变历史，IO 屏障在成功文档命令之后建立，下一次成功编辑解除屏障。
- 空栈 undo/redo 分别返回 `error: nothing to undo` / `error: nothing to redo`；屏障期间两者统一返回 `error: undo not allowed after io command`。
- `move 0 0`、`scale 1` 和 `set` 到相同值属于成功但不改变状态的操作，不制造空历史单元，也不清除已有 redo。
- 撤销或重做恢复成功但结果构造失败时，命令先反向恢复状态再返回失败；未知异常由执行器统一输出 `error: command failed`，不泄漏实现信息。
- `delete` 记录被删节点的类型和原父级，undo 在可能时显示恢复到的容器；移动/缩放通过 Visitor 投影位置，不在命令层拼接输出文案。

阶段 6 已固定的补充边界：

- 外部 SVG 按 UTF-8 读取；根必须位于 `http://www.w3.org/2000/svg` 命名空间，`width`/`height` 必填且为有限正数；`viewBox` 可省略，存在时必须语义等于 `0 0 <width> <height>`。显式声明其他 XML 编码时拒绝，避免按错误字符集解释文件。
- 只接受 `rect`、`circle`、`ellipse`、`line`、`text`、`g` 六种元素及 1.9 明列属性；DOCTYPE、处理指令、非 SVG 命名空间、未知元素/属性、`transform`、`style`、`class`、`defs` 和 text 子元素均拒绝，不静默丢失内容。
- 显式 id 先完整收集并检查大小写敏感唯一性，再按文档顺序补齐缺 id；生成规则为 `标签名+序号`，跳过全部显式 id 和先前生成 id，警告只在整份读取成功后随结果返回。
- 文件缺失/不可读返回 `error: cannot read file: <path>`；XML 或语义非法返回单行具体错误。任何读取失败都不替换候选文档、默认路径、历史栈或屏障，也不输出 warning。
- `read` 成功将默认路径设为输入路径；无参数 `save` 写回该路径。`canvas` 无参数为查询，不入历史；带两个合法尺寸时整体替换画布尺寸，并按文档命令建立 IO 屏障。
- 新规格统一接收不可变 `ShapeStyle`，读取公共 `fill`/`stroke`/`stroke-width` 时不需要为每种图形保留平行样式构造协议。

阶段 7 已固定的补充边界：

- `tree` 无参数保留 `svg (w x h)` 画布根；`tree <id>` 以目标图形自身为根显示完整子树，不额外插入 `svg` 行。
- `show <id>` 首行显示 `type#id` 与实际父级；根级图形显示 `parent=svg`。几何属性和样式属性分别成行，省略未设置的样式。
- `tree`/`show` 的未知 id、参数错误和无文档错误均为单行 `error:`，不改文档、历史或 IO 屏障。
- 交互终端启用 `svg>` 提示并由 `readline` 处理输入回显；非交互管道不输出提示符，保持可回放脚本和自动化测试输出稳定。

## 架构简化重构（本轮）

用户要求按已讨论方案简化。保留四层依赖、Command、Composite、六种内置图形、局部精确历史和 IO 隔离；未修改冻结的 `doc/README.md`，未暂存、提交、推送或创建 tag。

实际改动：

- 新增泛型 `CompositeChangeSet`，统一组合变更集合的状态、空变更判断和 apply/revert；继续由 `ChangeSetExecutor` 执行失败补偿。删除树/属性两套重复集合，几何集合只保留有用途的单图形构造工厂。
- 删除 `TreeEditCommand`；结构命令直接复用 `EditChangeSetCommand` 的准备、提交、结果失败恢复和 undo/redo 流程，`ReorderShapeCommand` 保留 front/back 共用的结果逻辑。
- 删除结构、历史和查询三个薄命令工厂，简单命令创建收回 Dispatcher 定义表，help 仍同源。保留图形创建、文档参数和数值/属性编辑三类具有实际解码逻辑的工厂，避免 Dispatcher 同时承载全部解析细节。
- 用统一不可变查询快照替换六种查询 View、第二套 Visitor 和展示 Description；统一 Visitor 供 tree、show 和编辑位置摘要使用。几何、父级、样式与孩子集合均在投影时捕获，CLI 排版不读取可变领域对象。
- 生产 TypeScript 文件从本轮开始的 162 个减少到 147 个；查询目录从 15 个文件减少到 6 个。原有阶段 7 未提交改动继续保留。
- 调整禁止 Dispatcher 构造具体命令的旧源码断言；保留依赖方向、无运行期循环、一类一文件、Command 不绕过变更记录、分派位置和领域隔离守卫。

架构自查实际发现与修正：查询集合仅有 TypeScript readonly 不足以阻止运行期修改，本轮对集合及其数值元组防御性复制并冻结，并冻结快照和坐标值。明细投影通过独立、无共享可变状态的非递归 Visitor 实例实现，避免查询模式污染后续全树投影。领域仍封装行为和校验；应用快照只用于查询，不解析外部 token、不包含展示文案；CLI 只按明确的几何语义排版，没有新增图形名 switch。Command/Composite、精确旧值恢复和提交后失败补偿契约保持；插件/box 未扩展。

验证证据：

- `pnpm run check` 启动时因 pnpm 尝试创建工作区外用户缓存目录而返回 EPERM，未将该命令记为通过；改用已安装的本地工具执行其等价步骤。
- `node_modules/.bin/tsc.cmd --noEmit` 通过。
- `node_modules/.bin/vitest.cmd run` 通过：29 个文件、90 个测试，包含已有树结构、历史、失败状态、IO、架构和 e2e 回归；新增快照隔离/冻结、不访问明细子节点、文本空白/线段排版以及混合变更补偿回归。
- 新回归初次使用空文本时被现有 TextSpec 校验拒绝；测试已改为合法的单空格文本，未修改业务规则。
- `node scripts/clean.mjs` 与 `node_modules/.bin/tsc.cmd -p tsconfig.build.json` 通过。
- 构建产物 `node dist/bootstrap/entry.js` 实际回放六种图形创建、嵌套、分组/解组、move/scale、undo/redo、属性修改、addto、front/back、删除恢复、tree/show 和 save/read；无 error，父级、尺寸、SVG 样式与文本断言通过。烟测 SVG 已清理，未新增交付样例。
- 检查清理后的 dist，已删除的集合、继承层、View/Visitor 和薄工厂产物均不存在；`git diff --check` 通过。

本轮属于架构重构；阶段 8 的完整课程验收、真实浏览器预览与 final tag 仍未完成。

## 阶段 8：集成验收与文档收尾

开发与本轮验收已完成，等待用户检查工作区。未提交、推送或创建 final tag；没有将本轮检查等同于用户验收确认。

实际改动与证据：

- 新增 `tests/e2e/course-acceptance.test.ts`：自行构建生产入口，在隔离临时目录启动真实 CLI，逐字比较课程典型会话和流程图输出及 SVG；验证 other.svg 缺 id 警告、7 元素、另存再读语义等价，并回放失败后的树、路径、redo 与屏障行为。
- 新增 `tests/integration/save-failure-atomicity.test.ts`：在真实文件上注入临时文件创建、部分写入及同目标 rename 失败，检查旧文件、临时文件清理、完整历史状态、默认路径和 redo 可用性。未将故障注入描述为真实磁盘损坏或断电恢复能力。
- 扩展 session 边界测试，覆盖全部依赖文档命令；init 前同时准备非空 undo/redo 和默认路径，验证整体清理。init/read 本身是建立文档的入口，不属于无文档禁用命令。
- 新增 `tests/fixtures/acceptance/` 的两个回放脚本、完整期望输出、需求原始 other.svg，以及实际生成的 demo.svg/flowchart.svg。输出逐项与需求核对；固定列宽、线段显式 stroke、ASCII 启动提示等展示差异记录在验收文档。
- 发现容器移动 undo 的摘要沿用了正向增量；先用两个失败回归确认，再修改 `MoveShapeCommand.createResult`，让 undo 的语义结果携带反向位移，redo 仍使用正向位移；精确几何恢复流程未改动。
- 增加需求示例所用 `npm run cli` 启动别名（先构建），`.txt` 固定 LF 保证期望输出跨平台一致。
- 补齐 README 预留结果区的一致性自查与验收事实；冻结的第 1 节架构方案和第 2 节过程设计未改。测试矩阵 140 项：137 通过、3 N/A；自动化套件 31 文件、96 测试。

架构自查：实际检查类/字段封装、职责与层级依赖、分派与多态、Command/Composite 契约、领域类型输入、展示隔离、异常与失败原子性、扩展点及测试组织。本轮发现的问题是移动结果的撤销语义，已在命令结果构造处修正，未将方向计算散入 formatter、领域或新协议。创建参数工厂属于 create 子命令分派，领域/读取方向分别通过 ShapeFactory/SvgElementFactory 集中构建。无新增公共数据袋、树写入口或标签 switch；封闭 Visitor 与插件扩展继续留在既定后续边界。

实际检查命令与结果：

- `node_modules/.bin/tsc.cmd --noEmit`：通过。
- `node_modules/.bin/vitest.cmd run`：31 个文件、96 个测试通过；修复前的两个移动撤销用例按预期失败。
- `node scripts/clean.mjs`、`node_modules/.bin/tsc.cmd -p tsconfig.build.json`：通过。
- `git diff --check`：通过。直接调用本地工具避开前轮 pnpm 用户缓存问题，未声称本轮运行 pnpm check 或新的依赖漏洞审计。
- `'help' | npm.cmd run cli`：正常启动并输出完整命令帮助；npm 对现有 pnpm 配置 `node-linker` 提示兼容性警告，CLI 退出码为 0。对照 HEAD 验证 README 第 3 节之前的全部内容逐字未变。
- 初次 Computer Use 因无法识别浏览器 URL 停止，已停止该 UI 操作；受限环境的首次无头 Edge 未生成截图。随后获准使用独立 `.cache/acceptance-render` 配置运行无头 Edge，打开明确的项目本地 SVG，成功生成并实际查看 `doc/acceptance/demo.png` 和 `flowchart.png`。demo 的红圆/蓝矩形/标题及流程图的蓝橙矩形、连接线、中英文文字、撤销后 y=100 均符合样本。未操作用户现有浏览器配置，未声称跨浏览器或用户亲自验收。

可复现入口与详细证据：[阶段 8 验收记录](acceptance/README.md)。剩余工作仅为用户代码检查及后续明确授权的 Git 交付。

## 中文注释补充

按用户要求，在 14 个生产 TypeScript 文件中补充必要的中文注释，并将保存清理处已有英文注释改为中文。注释集中解释逆序补偿、子树删除保留内部关系、移动目标下标、跨父级分组顺序、Composite 候选值准备、几何精确恢复、命令串行队列、历史迁移与空变更、结果构造失败回滚、查询隔离及运行期冻结、同目录临时文件替换、显式 id 预收集和分词边界。未为简单访问器、明显的转发或图形几何计算逐行加注释。

本轮核对上述 14 个文件的差异，均为注释变更；保留开始时已有的阶段 8 工作区改动，未改冻结的 README，也未暂存、提交、推送或创建 tag。架构自查覆盖字段封装、职责和依赖方向、多态与分派、Command/Composite、领域输入、展示隔离、失败原子性、扩展点与测试组织；本轮未发现需要修改实现的新增问题，未改变类、契约、依赖或行为。

实际验证：`node_modules/.bin/tsc.cmd --noEmit` 通过；`node_modules/.bin/vitest.cmd run` 通过（31 个文件、96 个测试，含架构守卫、树结构、历史及 IO 失败边界）。本轮只改注释，未新增测试。

## 最终提交文档整理

本轮将 README 整理为作业要求的四部分，补充安装、构建和启动入口；替换早期待实现说明与重复验证日志，保留关键讨论、设计取舍、方案与实现差异、失败原子性边界和真实验收证据。未将实现调整冒充为最初设计。

同步清理工作记忆、开发计划、验收记录、测试清单，保留开发阶段顺序和测试事实；作业原文保持不变。协作规则同步反映用户授权的文档整理，未改变 Git 审查与授权要求。本轮不修改生产代码、测试实现或依赖。

实际验证：`node_modules/.bin/tsc.cmd --noEmit` 通过；`node_modules/.bin/vitest.cmd run` 通过（31 个文件、96 个测试）；`node scripts/clean.mjs` 和 `node_modules/.bin/tsc.cmd -p tsconfig.build.json` 通过；`'help' | node dist/bootstrap/entry.js` 正常输出全部命令并退出。脚本检查 6 份维护文档的日期标记、代码块闭合与 22 个本地链接均通过，README 四个必需部分和 PlantUML 图均存在。构建产物在 dist 中，沿用仓库忽略规则；本轮未重新生成浏览器截图，README 引用已有渲染证据。源码与架构说明对照未发现需修改实现的问题。

## 下一步建议顺序

1. 用户检查阶段 8 工作区差异及验收证据。
2. 用户提供提交信息后才提交；用户确认检查完成并要求推送后才推送。
3. 最终验收确认后，按用户明确指令创建并推送 `final` tag。

## 维护规则

每次完成一个实际工作阶段，更新当前状态、实际实现架构、决策和剩余问题。README 作为最终提交文档，按用户要求维护，并保留方案与实际调整的区别；本文件持续记录开发事实，不添加日期标记，不保存凭据、私密配置或未经验证的完成结论。
