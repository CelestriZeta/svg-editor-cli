import type { Command } from '../commands/contracts/Command.js';

/** 命令发现与构造契约；执行、历史仍由既有 Command 契约负责。 */
export interface CommandContribution {
  readonly name: string;
  readonly syntaxes: readonly string[];

  create(args: readonly string[]): Command;
}
