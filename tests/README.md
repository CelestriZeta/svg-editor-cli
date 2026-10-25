# Phase 1 测试清单

本文件定义计划测试，不代表业务测试已经实现。只有实际运行并留下证据的测试项才能标记为通过。

## 测试约定

测试层级：

- `U`：领域单元测试
- `C`：命令或组件测试
- `I`：应用、IO 或 CLI 集成测试
- `E`：端到端测试
- `M`：需要人工观察的验收项
- `A`：架构或静态检查

所有失败用例统一检查 `FAIL-STATE`：

- 文档树、父级、同级顺序、id 索引、几何和样式不变
- 当前默认路径不变
- undo/redo 栈不变
- 历史屏障状态不变
- 读取警告和待返回结果不泄漏
- 输出为单行 `error:` 错误，不输出堆栈或部分成功信息

复杂编辑除命令输出外，还要比较完整观察快照：父级、顺序、属性存在性、几何、文本和 id 索引。

需求没有规定精确文案或结果、但实现前必须固定的细节：

- 非法尺寸、负尺寸和数值范围的统一错误
- group 目标过少、目标重复和未知目标的具体错误
- addto 形成环时的具体错误
- front/back 已在边界时是否产生历史单元
- 空栈 undo/redo 的错误或空操作行为
- 最终文件替换失败时可以保证的恢复范围

这些行为应先写入 `doc/README.md` 边界决策，再由测试固定；实现中不得临时静默选择。

## 工程与架构

| ID | 层级 | Given / When | Then | 状态 |
|---|---|---|---|---|
| ARCH-01 | A | 执行 `pnpm run typecheck` | TypeScript 严格类型检查通过 | 通过 |
| ARCH-02 | A | 执行 `pnpm run test` | 测试运行器可执行 TypeScript 测试 | 通过 |
| ARCH-03 | A | 执行 `pnpm run build` | 生产代码成功输出到 `dist/` | 通过 |
| ARCH-04 | A | 检查 `src/domain` 的 import | 不导入 CLI、文件系统、XML 库或基础设施 | 通过（阶段 2 静态检查） |
| ARCH-05 | A | 检查生产类文件 | 一类一文件，文件名与类名一致，字段不公开为可变数据袋 | 通过（阶段 2 静态检查） |
| ARCH-06 | A | 搜索标签或类型名字分派 | 只出现在 `CommandDispatcher` 和 `ShapeFactory` | 通过（阶段 2 静态检查） |
| ARCH-07 | A | 检查生产模块依赖 | 无循环依赖，且依赖方向符合 README 1.7 | 通过（阶段 2 静态检查） |
| ARCH-08 | A | 检查命令实现 | 命令只校验和转发，不直接改树、id 索引或文件 | 通过（阶段 2 静态检查） |
| ARCH-09 | A | 检查启动装配 | `bootstrap` 注入具体实现，生产模块不反向依赖它 | 通过（阶段 2 静态检查） |
| ARCH-10 | A | 搜索本阶段范围外能力 | 没有 `EditorApi`、插件加载、GUI 或 `box` 实现 | 通过（阶段 2 静态检查） |

## 图形创建与属性

| ID | 层级 | Given / When | Then | 状态 |
|---|---|---|---|---|
| CREATE-01 | U | 创建 `rect`，给出 x、y、w、h 和可选 fill | 属性和值正确；省略 fill 时不保存该属性 | 通过（阶段 2） |
| CREATE-02 | U | 创建 `circle`，给出 cx、cy、r 和可选 fill | 属性和值正确；省略 fill 时不保存该属性 | 待实现 |
| CREATE-03 | U | 创建 `ellipse`，给出 cx、cy、rx、ry 和可选 fill | 属性和值正确；省略 fill 时不保存该属性 | 待实现 |
| CREATE-04 | U | 创建 `line`，给出 x1、y1、x2、y2 和可选 stroke | 属性和值正确；省略 stroke 时不保存该属性 | 待实现 |
| CREATE-05 | U | 创建 `text`，给出 x、y 和含空格文本 | 文本保存为子文本，空格和大小写保持不变 | 待实现 |
| CREATE-06 | U | 创建空 `g` | 容器没有子节点，可以作为后续操作目标 | 待实现 |
| CREATE-07 | C | 使用已存在 id 创建 | 返回 `error: id already exists: <id>` 且满足 `FAIL-STATE` | 通过（阶段 2） |
| CREATE-08 | U | 分别创建 `r1` 和 `R1` | 两个 id 均合法，证明大小写敏感 | 待实现 |
| CREATE-09 | C | 创建六种受支持类型之外的 `hexagon` | 返回 `error: unknown shape type: hexagon (is the plugin loaded?)` 且满足 `FAIL-STATE` | 通过（阶段 2） |
| CREATE-10 | E | 执行 `create box ...` | 按未知类型拒绝，不能创建容器或子节点 | 待实现 |
| CREATE-11 | U | 六种类型分别使用 `in <gid>` 创建 | 节点成为指定容器的最后一个子节点 | 待实现 |
| CREATE-12 | C | `in` 指向不存在的 id | 返回 `error: no such container: <id>` 且满足 `FAIL-STATE` | 待实现 |
| CREATE-13 | C | `in` 指向叶子图形 | 返回 `error: not a container: <id>` 且满足 `FAIL-STATE` | 待实现 |
| CREATE-14 | C | 缺少必需参数、参数过多、数字非法或 id 为空 | 返回单行 `error:`，不得部分创建，且满足 `FAIL-STATE` | 部分通过（阶段 2 覆盖缺参、空字符串和十六进制；id 为空待补） |
| SET-01 | U | 对每种图形设置自身白名单中的几何属性 | 只有目标属性变化，类型和父子关系不变 | 待实现 |
| SET-02 | U | 设置 `fill`、`stroke`、`stroke-width` | 普通叶子正确保存对应样式 | 待实现 |
| SET-03 | U | 对 `text` 设置 `text` | 只替换文本内容，不改 x/y | 待实现 |
| SET-04 | U | 对普通 `g` 设置样式 | 只修改 g 自身样式，不覆盖或传播给子孙 | 待实现 |
| SET-05 | C | 对某类型设置其他类型的几何属性 | 返回 `error: unknown attribute: <attr>` 且满足 `FAIL-STATE` | 待实现 |
| SET-06 | C | 设置需求白名单外的属性，包括 `font-size`、`text-anchor` | 返回 `error: unknown attribute: <attr>` 且满足 `FAIL-STATE` | 待实现 |
| SET-07 | C | 设置非法数字或空文本 | 返回单行 `error:`，保留原值且满足 `FAIL-STATE` | 待实现 |

## 几何与 Composite

| ID | 层级 | Given / When | Then | 状态 |
|---|---|---|---|---|
| GEO-01 | U | 对叶子执行 `move`，使用正负浮点增量 | 全部位置属性按增量变化，非位置尺寸不变 | 待实现 |
| GEO-02 | U | 对多层容器执行 `move` | 全部子孙递归平移一次，父子结构不变 | 待实现 |
| GEO-03 | U | 对叶子执行正数 `scale` | 位置和自身全部尺寸按同一 factor 缩放 | 待实现 |
| GEO-04 | U | 对多层容器执行 `scale` | 全部子孙递归缩放一次，不重复缩放 | 待实现 |
| GEO-05 | U | 对 `text` 执行 `scale` | 只缩放 x、y；不新增或修改 font-size | 待实现 |
| GEO-06 | C | `scale` 使用 0、负数、NaN 或 Infinity | 返回 `error: scale factor must be positive` 或统一数值错误，且满足 `FAIL-STATE` | 待实现 |
| GEO-07 | C | 多节点容器缩放中某个后代数值非法 | 在执行前完成全部校验，所有节点均保持原值 | 待实现 |
| GEO-08 | U | Visitor 遍历嵌套容器 | 顺序为 enterGroup -> 子树 -> leaveGroup | 待实现 |
| GEO-09 | U | Visitor 在 enterGroup 跳过子树 | 不访问该容器的任何子孙，但后续兄弟仍正常访问 | 待实现 |
| DELETE-01 | U | 删除叶子 | 节点、id 索引和父级引用同时移除 | 待实现 |
| DELETE-02 | U | 删除容器 | 整个子树删除，操作记录为一个 undo 单元 | 待实现 |

## 树结构与顺序

| ID | 层级 | Given / When | Then | 状态 |
|---|---|---|---|---|
| TREE-01 | U | 同一父级选择多个图形执行 `group` | 新组成为最近公共祖先的最后一个子节点，组内按参数顺序排列 | 待实现 |
| TREE-02 | U | 从不同父级选择图形执行 `group` | 新组挂到最近公共祖先最后，所有目标从原父级摘除且组内顺序稳定 | 待实现 |
| TREE-03 | C | `group` 使用已存在的新 id、目标过少、未知目标或重复目标 | 返回单行 `error:` 且满足 `FAIL-STATE` | 待实现 |
| TREE-04 | C | 同时选择容器及其祖先或子孙 | 返回 `error: cannot group a container into its own descendant: <gid>` 且满足 `FAIL-STATE` | 待实现 |
| TREE-05 | U | `ungroup` 非根级容器 | 子节点按原顺序替换容器在原父级中的位置 | 待实现 |
| TREE-06 | C | `ungroup` 根级容器 | 返回 `error: cannot ungroup top-level container: <gid>` 且满足 `FAIL-STATE` | 待实现 |
| TREE-07 | U | `addto` 已有图形到容器 | 从原父级移除，作为目标容器最后一个子节点 | 待实现 |
| TREE-08 | C | `addto` 把容器移入自身或子孙 | 返回单行 `error:`，不形成环且满足 `FAIL-STATE` | 待实现 |
| TREE-09 | C | `addto` 目标不存在或不是容器 | 返回对应单行 `error:` 且满足 `FAIL-STATE` | 待实现 |
| TREE-10 | U | 对中间位置节点执行 `front` 和 `back` | 节点移动到同级最后或最前，其他节点相对顺序不变 | 待实现 |
| TREE-11 | U | 对已在最前或最后的节点执行对应操作 | 不改变任何节点顺序；是否入栈按已记录决策验证 | 待实现 |
| TREE-12 | U | 完成 group、ungroup、addto、front、back | 父引用、同级顺序、后代顺序和 id 索引均一致 | 待实现 |
| TREE-13 | C | 对叶子图形执行 `ungroup` | 返回单行容器类型错误且满足 `FAIL-STATE` | 待实现 |

## 局部变更记录与撤销重做

| ID | 层级 | Given / When | Then | 状态 |
|---|---|---|---|---|
| CHANGE-01 | C | create 后 undo/redo | undo 恢复原父级和位置；redo 恢复同一节点和 id | 通过（阶段 2 根节点范围） |
| CHANGE-02 | C | delete 子树后 undo/redo | undo 恢复完整子树、父级、顺序和 id 索引；redo 再次完整删除 | 待实现 |
| CHANGE-03 | C | move 后 undo/redo | 恢复全部受影响节点的精确旧值/新值 | 待实现 |
| CHANGE-04 | C | scale 后 undo/redo | 使用记录的旧值/新值恢复，不通过反向计算 | 待实现 |
| CHANGE-05 | C | set 后 undo/redo | 正确恢复旧值、新值及属性原先是否存在 | 待实现 |
| CHANGE-06 | C | group 后 undo/redo | 恢复各节点原父级、原顺序和新组 | 待实现 |
| CHANGE-07 | C | ungroup 后 undo/redo | 恢复容器、子树和原父级位置 | 待实现 |
| CHANGE-08 | C | addto 后 undo/redo | 恢复源父级、目标父级及双方顺序 | 待实现 |
| CHANGE-09 | C | front/back 后 undo/redo | 恢复前后位置和完整同级顺序 | 待实现 |
| CHANGE-10 | C | 一次 group 操作包含多个图形后 undo | 一次 undo 恢复全部变化，仍为一个历史单元 | 待实现 |
| CHANGE-11 | C | 合法编辑后 undo，再 redo | redo 复用首次记录，不重新分配 id | 待实现 |
| CHANGE-12 | C | 编辑校验失败 | 不产生 ChangeSet，不压入 undo | 待实现 |
| CHANGE-13 | C | undo 或 redo 恢复失败 | 文档和两个历史栈均保持操作前状态 | 待实现 |

## 命令、执行器与历史

| ID | 层级 | Given / When | Then | 状态 |
|---|---|---|---|---|
| TARGET-01 | C | 任一依赖图形 id 的命令使用不存在 id | 返回 `error: no such shape: <id>` 且满足 `FAIL-STATE` | 待实现 |
| CMD-01 | C | Dispatcher 接收已知命令 | 通过对应描述符创建正确命令，参数传递完整 | 待实现 |
| CMD-02 | C | Dispatcher 接收未知命令 | 返回单行 `error:`，不修改任何状态 | 待实现 |
| CMD-03 | C | Dispatcher 接收缺参数、多参数或错误类型 | 返回单行 `error:` 且满足 `FAIL-STATE` | 待实现 |
| CMD-04 | C | 从描述符生成 help | help 与描述符同源，覆盖全部命令和语法 | 通过（阶段 2 已实现命令范围） |
| EXEC-01 | C | 提交依赖异步 IO 的多条请求 | 按顺序串行执行，前一项完成后才执行下一项 | 待实现 |
| EXEC-02 | C | IO 失败 | 不更新历史或屏障，后续请求仍能按规则执行 | 通过（阶段 2） |
| HIST-01 | C | 执行一条编辑命令 | undo 恰好增加一个单元，redo 栈清空 | 待实现 |
| HIST-02 | C | undo 后执行新编辑 | redo 栈清空，新编辑进入 undo 栈 | 待实现 |
| HIST-03 | C | 执行 tree、show、help、无参 canvas | undo/redo 栈不变 | 待实现 |
| HIST-04 | C | init、read、save 或修改尺寸的 canvas 成功 | 旧历史清除，undo/redo 返回 `error: undo not allowed after io command` | 待实现 |
| HIST-05 | C | 历史屏障后执行一条成功编辑 | 屏障解除，可以撤销这条新编辑 | 通过（阶段 2；撤销命令待阶段 5） |
| HIST-06 | C | init/read 替换文档 | 旧文档历史和路径按规则清理，旧命令不能作用于新文档 | 通过（阶段 2 的 init 部分） |
| HIST-07 | C | save 成功 | 即使模型未变也建立历史屏障，并按路径规则更新默认路径 | 通过（阶段 2） |
| HIST-08 | C | init/read/save 的 IO 或校验失败 | 文档、路径、两个历史栈和屏障均满足 `FAIL-STATE` | 部分通过（阶段 2 init/save；read 待阶段 6） |
| HIST-09 | C | 空栈执行 undo 或 redo | 按已固定行为返回单行错误或无操作；状态不变 | 待实现 |
| HIST-10 | C | 无文档执行 help 和其他命令 | help 成功；其他命令返回 `error: no document. use 'init' or 'read' first` | 待实现 |

## 文档命令与 SVG IO

| ID | 层级 | Given / When | Then | 状态 |
|---|---|---|---|---|
| DOC-01 | I | 无参数执行 init | 创建 800x600 空画布 | 通过（阶段 2） |
| DOC-02 | I | init 指定合法宽高 | 创建对应尺寸的空画布 | 通过（阶段 2） |
| DOC-03 | I | init 使用 0、负数、非数字或 Infinity | 返回单行 `error:` 且当前会话满足 `FAIL-STATE` | 部分通过（阶段 2 覆盖 0、Infinity、十六进制；负数与非数字待补） |
| DOC-04 | I | init 成功 | 清除旧文档历史、默认路径和 redo 栈 | 部分通过（阶段 2 覆盖历史清理；redo/路径断言待补） |
| CANVAS-01 | I | 无参数执行 canvas | 直接显示当前宽高，不进入历史 | 待实现 |
| CANVAS-02 | I | canvas 指定合法宽高 | 更新画布尺寸，建立历史屏障 | 待实现 |
| CANVAS-03 | I | canvas 尺寸非法 | 返回单行 `error:` 且满足 `FAIL-STATE` | 待实现 |
| READ-01 | I | 读取包含六种类型和嵌套 g 的合法 SVG | 尺寸、属性、文本、层级、顺序和 id 全部正确 | 待实现 |
| READ-02 | I | 读取多个缺 id 元素 | 按标签名和序号确定性补齐，碰撞时跳过已占用 id | 待实现 |
| READ-03 | I | 缺 id 元素大小写不同或已存在同类序号 | 生成不与现有 id 冲突的 id，大小写按规则敏感 | 待实现 |
| READ-04 | I | 合法文件含缺 id | 逐个输出精确 warning，且 warning 在替换会话成功后返回 | 待实现 |
| READ-05 | I | 文件含重复 id | 返回 `error:`，不替换会话，不输出成功警告 | 待实现 |
| READ-06 | I | 文件含 transform、style、class、defs、未知元素或未知属性 | 明确拒绝，不静默丢弃数据，且满足 `FAIL-STATE` | 待实现 |
| READ-07 | I | viewBox 省略或严格等于 `0 0 <width> <height>` | 接受并正确建立画布 | 待实现 |
| READ-08 | I | viewBox 需要真实坐标变换 | 明确拒绝且满足 `FAIL-STATE` | 待实现 |
| READ-09 | I | XML 含合法命名空间、注释、空白、实体和特殊字符 | 只保留支持的文本和属性，解析与转义正确 | 待实现 |
| READ-10 | I | 读取省略 fill 或 stroke 的支持元素 | 模型中不凭空增加可选属性 | 待实现 |
| READ-11 | I | read 成功 | 更新默认路径、清除旧历史，按历史规则建立屏障并显示节点数 | 待实现 |
| READ-12 | I | 文件不存在、不可读、XML 损坏或语义非法 | 返回对应 `error:`，候选文档和警告不得影响当前会话 | 待实现 |
| SAVE-01 | I | read 后执行无参数 save | 写回当前默认路径 | 待实现 |
| SAVE-02 | I | 使用显式路径 save 成功 | 写入该路径，并将其设为新的默认路径 | 通过（阶段 2） |
| SAVE-03 | I | init 后执行无参数 save | 返回单行路径错误且满足 `FAIL-STATE` | 通过（阶段 2） |
| SAVE-04 | I | 保存支持范围内的文档 | 输出标准 SVG 声明、命名空间、尺寸、viewBox 和正确层级 | 通过（阶段 2 的 rect 范围） |
| SAVE-05 | I | 保存省略 fill/stroke 的图形 | 输出中不主动补写可选属性 | 待实现 |
| SAVE-06 | I | 成功保存 | 先写同目录临时文件，再替换目标；临时文件清理 | 通过（阶段 2 真实临时目录） |
| SAVE-07 | I | 临时文件创建或写入失败 | 原文件、当前文档、路径、历史与屏障不变，临时文件清理 | 待实现 |
| SAVE-08 | I | 最终替换失败 | 旧文件仍可读；当前文档、路径、历史和屏障不变，临时文件清理 | 待实现 |
| ROUND-01 | I | 构建包含六种图形、嵌套和样式的文档并保存再读取 | 模型语义等价，不要求 XML 字节相同 | 待实现 |
| ROUND-02 | I | 保存后统计元素 | 不计根 svg，统计全部图形和 g 容器，包含嵌套节点 | 待实现 |

## CLI 与显示

| ID | 层级 | Given / When | Then | 状态 |
|---|---|---|---|---|
| CLI-01 | I | 启动 REPL | 显示版本提示和 `svg>`，命令逐行处理 | 待实现 |
| CLI-02 | I | 从脚本输入多行命令 | 按行回放，空行被忽略，结果顺序稳定 | 通过（阶段 2 构建产物管道回放） |
| CLI-03 | I | 行首为 `#` | 整行作为注释，不执行也不改变状态 | 通过（阶段 2 分词测试） |
| CLI-04 | I | 行首有空格后出现 `#`，或颜色参数含 `#` | 不把非行首或非整行 `#` 当成注释 | 通过（阶段 2 分词测试） |
| CLI-05 | I | 参数使用双引号且包含空格、空字符串或 `#` | 作为一个参数保留，不改写文本内容 | 部分通过（阶段 2 覆盖带空格路径；空字符串与引号内 `#` 待补） |
| CLI-06 | I | 数字参数使用合法小数和负数 | 解析为有限浮点数并传给命令 | 待实现 |
| CLI-07 | I | 引号未闭合、参数缺失或多余、非法数字 | 返回单行 `error:` 且满足 `FAIL-STATE` | 部分通过（阶段 2 覆盖未闭合引号、缺参、空字符串和十六进制） |
| CLI-08 | I | 任一命令失败 | 只输出一行 `error:`，不输出堆栈、warning 或部分成功摘要 | 通过（阶段 2 已实现命令） |
| CLI-09 | E | 每类编辑命令成功 | 输出对应单行成功摘要，名称、id 和关键值符合需求 | 待实现 |
| CLI-10 | I | 执行 `tree` 和 `tree <id>` | 根、缩进、连接线、顺序和关键几何属性正确 | 待实现 |
| CLI-11 | I | 执行 `show <id>` | 显示类型、id、父级和属性明细，格式符合需求 | 待实现 |
| CLI-12 | I | `tree` 或 `show` 使用未知 id | 返回对应单行错误，且不进入历史 | 待实现 |
| CLI-13 | I | 执行 `help` | 覆盖 init、read、save、canvas、全部编辑、显示和 undo/redo | 待实现 |

## 端到端验收

| ID | 层级 | Given / When | Then | 状态 |
|---|---|---|---|---|
| E2E-01 | E | 回放需求第 6 节完整会话 | 创建、group、tree、move、undo/redo、set、失败 group、delete/undo、save 屏障、read 警告和最终 tree 全部符合 transcript | 待实现 |
| E2E-02 | E | 回放需求第 6.1 节流程图版本 A | 使用 in 建立层级、容器移动与 undo、文本修改和保存结果正确 | 待实现 |
| E2E-03 | E | 读取外部示例 `other.svg` 后保存再读 | 缺 id 警告、节点数、层级和模型语义正确 | 待实现 |
| E2E-04 | E | 在真实 CLI 中触发失败命令后再查看状态 | 输出、文档、路径、历史和屏障均符合 `FAIL-STATE` | 待实现 |
| E2E-05 | E | 执行 `create box` 和插件未知类型 | 均按未知类型拒绝，不创建部分结构 | 待实现 |
| E2E-06 | M | 保存 demo 和流程图 SVG 后用浏览器打开 | 几何、颜色、层级和文字显示正确，无缺失内容 | 待实现 |
| E2E-07 | E | 最终执行全部测试、类型检查和构建 | 全部通过，实际输出记录到 `doc/README.md` | 待实现 |

## 明确不在本阶段执行的测试

| ID | 项目 | 原因 |
|---|---|---|
| N/A-01 | `box` 创建、内部结构、传播属性和 round-trip | `box` 属于后续插件阶段；本阶段只测试未知类型拒绝 |
| N/A-02 | `error: cannot ungroup composite shape` | 本阶段没有可创建的非 g 复合图形，待复合类型引入后启用 |
| N/A-03 | 插件加载、GUI、宿主集成和 `EditorApi` | 明确不在 Phase 1 范围 |

测试实现后，按测试 ID 在 `doc/README.md` 记录真实命令、结果和证据；未运行的项目不得标记为通过。
