# ADR-004：图形规格多态构造与只读关系门面

状态：CLI 重构第 3 步已采用；查询、SVG 与复合子树尚未插件化。

## 背景与决策

仅注册 CLI 参数 Builder 仍无法消除领域 ShapeFactory 对六种类型的枚举；直接把 ShapeTree 交给 provider 又会泄漏树写接口。

- 六个 Builder 移入 builtin-shapes 并改为实现 ShapeProvider 的类。每个类贡献名字、冻结的完整 create 语法和 createSpec；数字及 CLI 语法仍在应用边界处理。
- PluginRegistry 实现只读 ShapeCatalog，创建工厂与 create 命令帮助均查询当前发布版本，禁止命令插件导入具体图形插件。没有 provider 时保留通用 create 帮助，执行未知类型报原约定错误。
- ShapeSpec 增加 create(ShapeRelations) 行为，各具体规格负责构造相应领域图形。ShapeFactory 不再枚举名字或规格类，只提供关系门面、调用规格行为及检查返回对象的 Shape 身份、id 和 type。
- ShapeRelations 只提供 parentOf/childrenOf；ShapeFactory 每次传入冻结的两方法门面，内部 ShapeTree 不离开聚合实现。图形构造参数依赖该接口而非具体树。
- 创建工厂校验 provider 返回的规格必须是 ShapeSpec，且 id/type 与请求相符。规格创建、领域构造和校验均先于原有树 ChangeSet 提交；失败不影响树、历史和 redo。redo 仍复用首次创建的对象。

## 取舍与阶段边界

这是对第 1 步初版 ShapeProvider 的实际贯通。采用规格多态，而非给 provider 增加接收内部树的构造回调；规格从纯参数载体增加构造行为，但依然没有 CLI、文件系统或 XML 依赖。具体图形与规格保留为公开领域对象，注册层管理默认可用的创建类型。

现有 Visitor、查询快照和 SVG 适配器仍针对六种图形，第 4 步再改造；读入现有 SVG 当前不查询 ShapeCatalog。复合子树、结构保护与 box 留待后续，不把单节点 create 扩展声称为完整图形插件交付。此步没有动态配置加载或最终指标。

## 实际验证

registered-shapes.test.ts 覆盖默认顺序、无 provider、迟到注册、失败激活、非法帮助、错误规格保留 redo、只读门面和非法构造结果。原六图形、in、Composite、历史和课程会话继续由完整回归覆盖。架构守卫禁止领域工厂类型枚举、命令工厂私有图形表与插件跨包导入。实际结果见 [报告第 8 节](../README.md)。
