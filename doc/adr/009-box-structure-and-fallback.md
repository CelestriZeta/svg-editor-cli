# ADR-009 box 复合结构与读回

状态：已实施。

BoxSpec 一次产生容器及 id-rect/id-label 两个子规格；默认框 fill=#4a90d9，标题 x+20、y+h/2+5。BoxShape 用传入最终候选关系检查两个直接子部件的身份后缀与 Rect/Text 类型；可追加子节点（含 box），必要部件不允许移走/删除/再分组。整个 box 可移动、缩放、删除、入组，一次创建或删除为一个历史单元；默认复合容器拒绝 ungroup。

SVG 编码是 g + data-kind=box；已装插件时缺失/错误部件拒绝整份读入，保留旧会话。未装插件时按 g 降级，保留全部实际后代和样式，但不保留 box 属性语义或标记。重复 id 始终拒绝。解码从实际 XML 子节点建树，不用创建模板修补。

BoxAttributeHandler 将 fill/label 分别准备到 rect.fill/text.text，借用统一事务。反馈使用现有通用 created/updated 文案，几何和属性行为与需求会话一致；不在内核增加 box 专用反馈分支。(box) 由独立 TreeDecorator 类提供，与渲染器解耦。

取舍：直接子部件 id 属于插件不变量，用户应操作整体或仅编辑部件属性；严格拒绝比静默修复更容易判断失败原子性。
