# ADR-007 属性处理与事务

状态：已实施。

处理器接收只读 ShapeSnapshot，以 kind/id 判断是否负责；通过 AttributeEditContext 准备类型化子部件变更，不持有文档写入口。多个处理器命中直接报 ambiguous attribute handler，不按注册顺序覆盖。零命中执行原白名单与数字解析；命中后异常不得回退。

prepare 必须无副作用，返回 ChangeSet 与读取当前语义值的方法。一次 set 只提交一个 ChangeSet，多部件由 CompositeChangeSet 组合；原编辑命令负责执行、撤销、重做及结果读取失败补偿。每个最小 ChangeSet 必须自身失败原子，组合器补偿此前成功的子变更；插件任意绕开契约的外部副作用不在补偿范围内。

代价：插件必须显式准备变更，不能直接写字段；冲突需要由配置禁用其中一个处理器解决。
