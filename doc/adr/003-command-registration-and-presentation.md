# ADR-003：命令通过目录分发，插件展示在结果构造期完成

状态：CLI 重构第 2 步已采用。

## 背景

Phase 1 的 CommandDispatcher 同时组装具体命令、校验简单参数和生成 help。注册接口加入后，如果它仍持有固定表，追加命令就仍须修改内核。现有结果 Visitor 同样枚举内置结果，直接增加 visitStats/visitDirectory 会形成第二处封闭扩展。

## 决策

- 内置表及 30 个具体实现文件迁入 src/plugins/builtin-commands；插件以 BuiltinCommandContribution 类实例按原顺序注册。框架保留执行、历史、局部变更基类、通用错误、语义结果与支持工具。
- Dispatcher 只依赖只读 CommandCatalog；PluginRegistry 查询当前已发布版本，不传入某次 ExtensionRegistry 快照。help 也查询同一目录，因此后续成功插件立即可见，失败批次不出现。
- 插件通过 ActiveDocument、DocumentOperations、HistoryController、DocumentQuery 使用公开应用能力，不导入其具体实现；由 Main 注入与执行器共享的真实对象。公开 API 用架构守卫限制，TS export 不等同于插件可任意导入。
- CommandContribution 的语法数组必须包含非空单行字符串；BuiltIn 贡献复制并冻结该数组。重复注册或非法元数据仍走第 1 步事务拒绝整批。
- 新命令可返回 PresentedCommandResult<T>，具体文案由插件的 CommandPresenter<T> 生成。通用结果构造时调用一次 presenter 并缓存字符串，CLI 的通用访问方法只读取缓存，不因新结果类型修改。
- 工厂抛错或返回非 Command 时，Dispatcher 返回通用失败命令并保留 cause；领域错误保留其语义。Query 类别不修改历史，既有文档命令的 IO 屏障语义不变。

## 实际调整与取舍

最初讨论的是由 CLI 在排版时调用插件 presenter；实际实现将这次调用提前到结果构造期。编辑插件继承 EditChangeSetCommand 并在 createResult 构造通用结果时，如果 presenter 失败，既有模板能撤回修改，历史尚未录入；undo/redo 也可以恢复原状态。若延迟到 REPL 排版阶段才调用，编辑可能已经完成并进入历史，失败补偿会跨越更多层次。

代价是通用结果在构造时携带插件展示协作者，并保留其生成的文本；应用公共代码只定义调用契约，不包含具体业务文案，语义值仍保留在 value 中。插件 presenter 须只读取其结果值，结果值应使用不可变语义对象；框架不声称能够撤销插件绕过契约执行的副作用。对于未来其他宿主，可由相应装配注入自己的 presenter。

代码包保留在 src 内，以维持现有 TypeScript rootDir 和 CLI 产物路径，没有引入 workspace 打包或依赖安装变化。包声明已列出贡献，动态加载、manifest 校验及 options 在后续第 8 步接入，不把当前显式装配当成配置装配。create 的六个规格 Builder 暂时随内置命令迁移，后续图形注册化时再拆分。

## 验证依据

[注册命令集成测试](../../tests/integration/registered-commands.test.ts) 覆盖空分发器、无文档插件命令、动态 help、失败激活不可见、查询保持 redo、工厂异常/返回值、非法语法及执行/撤销/重做的展示失败原子性。原命令分发、help 与课程会话回归继续通过；[架构守卫](../../tests/integration/architecture.test.ts) 检查单类文件、无环、层级、公开 API 与不反向依赖插件。实际结果和 final 字节比较见 [报告第 7 节](../README.md#7-cli-重构第-2-步内置命令注册化与动态-help)。
