# ADR-008 双装配与原子清单校验

状态：已实施。

组合根默认激活六图形及原命令，随后选择 CodePlugins（代码装配）或 --config path（配置装配），两者调用 PluginRegistry.activate。manifest 在 activate 完成但发布注册之前比较四类名字集合；失败只丢弃本次暂存，保留先前插件。声明顺序不影响集合比较，插件激活顺序决定标签及帮助顺序。

默认导出支持插件类（构造参数 services、options）或 activate 实例。options 原样作为构造的第二参数；应只读使用。相对路径按配置目录解析，包名按 Node createRequire 解析；目录通过 package.json main（缺省 index.js）定位。模块解析成功后，其求值/依赖错误属于激活失败，不能伪装顶层模块缺失。配置先完整验证，再顺序加载，enabled:false 完全跳过。插件是受信任的进程内代码，不是隔离沙箱。

代价：本地 TS 插件需先构建成 JS；构建复制 package.json 保留 contributes。动态能力不承诺重新加载或卸载。
