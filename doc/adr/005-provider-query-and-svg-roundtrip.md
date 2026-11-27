# ADR-005：通用遍历与 provider 编解码，按类型标记恢复或降级

状态：CLI 重构第 4 步已采用。box 与复合子树结构保护尚未实现。

## 决策

- ShapeVisitor 只定义 visitShape、enterContainer、leaveContainer。Shape 提供默认叶子访问，ContainerShape 控制递归与跳过；ShapeCollector 共用协议收集完整子树，不再枚举六种图形。
- ShapeProvider 新增 project、encode、decode、validateImported，声明 svgTag 与 SvgContentKind。注册时检查方法、标签及内容模型；类型语义位于 provider，通用适配器不导入具体图形。
- 查询使用不可变 GeometrySnapshot；ShapeSnapshot 的 type 为展示标签，kind 保留逻辑类型，isContainer 表示实际 Composite。几何投影可使用新属性名，领域 set 白名单不变。
- XML 库类型只存在于基础设施。provider 接收冻结的 SvgShapeInput，返回类型化规格；encode 返回不可变 SvgShapeOutput。框架负责公共属性、转义、缩进和根元素，拒绝重复/保留属性、非法名称及非有限数字。
- 逻辑类型名不同于物理标签时写 data-kind。读入优先查已注册标记，并验证物理标签匹配；未知标记按基础标签降级，无基础 provider 时拒绝，空标记也拒绝。普通 g 能保留子树与样式，丢弃未知语义标记。
- 已注册类型解码失败、返回错误规格、容器能力不符或 validateImported 失败，拒绝整份读入。validateImported 在后代接入候选文档后调用，供未来插件验证必要部件。重复 id 无论是否降级都全局拒绝；缺 id 按真实标签分配。

## 取舍与边界

候选文档成功返回后 DocumentService 才替换当前文档；完整序列化成功后才进入原有临时文件写入流程。查询、编码与读回验证须同步、只读；框架校验结构与返回值，不承诺补偿插件在契约之外执行的任意副作用。

与不断增加 visitBox 等方法相比，通用遍历无需知道新类型；代价是所有 provider 必须提供投影和编解码能力。目录显式注入，内核不偷偷安装默认插件。测试静态目录替身不替代生产注册事务测试。

语法节点与领域对象继续分离，遍历和格式化仍使用递归，未新增极深树性能或完整 SVG 支持承诺。复合创建、必要部件保护属于第 5 步，本步不代表 box 已实现。

## 验证与实际修正

provider-roundtrip.test.ts 用独立 marked 容器验证嵌套查询与往返、缺插件降级、标记冲突、重复 id、错误产物及真实 IO 失败。读回验证失败保留原文档、默认路径和 redo，编码失败保留目标字节及目录列表。

自查修复原 SvgAttributes 按 local 名索引会隐藏被普通 id 覆盖的 xml:id 的问题，改按完整 name 保存，并补严格拒绝用例。架构守卫禁止通用层导入六种图形或恢复专用访问方法。实际结果见 [报告第 9 节](../README.md)。
