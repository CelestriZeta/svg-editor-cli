# ADR-001：VSCode 使用独立源码大纲，宿主管理查询与编辑

状态：第一部分已采用。

## 背景

Phase 1 是六类型 SVG 编辑器，读取会构建领域文档、补全 id 并拒绝其他标签。第一部分只需提供源文件装饰与源码大纲，需支持无 id、任意 SVG 元素和未保存的半成品 XML，并保留跳转位置。

## 决策

- 扩展放在 extensions/svg-tools，复用 saxes 依赖，不导入 CLI 源码；语法树持有 UTF-16 偏移、标签名和嵌套关系。
- 每次大纲请求从当前 TextDocument.getText 构造新树。解析失败返回空结果，不缓存旧树，不修改源文本或分配 id；DOCTYPE 被拒绝，避免引入外部实体解析。
- 由两个类实现宿主 provider 接口，extension.ts 只装配和注册；UI、编辑事件调度、跳转、文本撤销与资源释放归 VSCode。扩展不引入自己的编辑 Command/history。
- 源码沿用 TypeScript 严格 ESM；esbuild 把 saxes 一并打包成 .cjs，vscode 保持 external，由宿主提供。VSIX 无运行时 node_modules 依赖。

## 取舍

避免领域模型与外部文本语法耦合，也避免为本部分改动 Phase 1 的行为与历史。代价是不能直接复用其领域 Visitor，且每次请求完整解析，未针对超大文件实现增量解析。无效输入允许空大纲，不提供完整 SVG 验证或诊断。

可以选择扩展原 SvgTreeParser 以保留范围，但会让严格编辑导入和宽松源码展示承担不同契约；也可以用正则表达式找标签，但引号、多行、注释、CDATA 和实体容易产生错误。当前采用专用 XML 解析器加轻量语法树。

## 验证依据

单元测试覆盖层级、缺 id、path/defs、命名空间、CRLF、Unicode、注释/CDATA、实体、编辑重建与非法 XML；provider 测试覆盖文件类型、取消、文件消失及资源释放。真实宿主验证及最终结果统一记录在 [实验报告](../README.md)。本 ADR 不代表第二部分的属性事务、box 降级或 dirty 策略已作决定。

## 0.1.1 的实际调整：默认源码编辑器

用户实测发现 Outline 点击会重新解析 SVG 的默认编辑器而进入 Image Preview。原先 showTextDocument 的宿主测试强制源码，遗漏了这个边界。补充按 URI 和符号 selection 执行 vscode.open 的回归，先在旧 manifest 下确认失败，再通过 configurationDefaults 提供 SVG → default（Text Editor）关联修复；并验证显式图片预览仍可用、再次按符号导航回到源码以及大写后缀定位。

该声明仅提供默认值，不运行 update 写用户配置。同名显式用户或工作区设置可覆盖默认项；已有预览关联的处理步骤写入安装说明。没有拦截原生 Outline 点击或增加编辑器切换监听器，编辑器解析继续归宿主。这里记录的是用户反馈后的调整，不把它追述为初版已验证的设计。
