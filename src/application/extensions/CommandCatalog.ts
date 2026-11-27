import type { CommandContribution } from './CommandContribution.js';

/** 当前已发布命令的只读查询入口，不固定某次注册快照。 */
export interface CommandCatalog {
  findCommand(name: string): CommandContribution | undefined;
  commandSyntaxes(): readonly string[];
}
