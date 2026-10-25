import { CommandSyntaxError } from './CommandSyntaxError.js';

export class CommandLineParser {
  public parse(line: string): string[] | null {
    // 只有行首的 # 表示注释，参数中的 #（如十六进制颜色）必须保留。
    if (line.trim().length === 0 || line.startsWith('#')) {
      return null;
    }

    const tokens: string[] = [];
    let current = '';
    // 空引号也构成一个参数，不能仅凭 current 是否为空判断 token 是否存在。
    let tokenStarted = false;
    let quoted = false;

    for (const character of line) {
      if (character === '"') {
        quoted = !quoted;
        tokenStarted = true;
        continue;
      }

      if (/\s/.test(character) && !quoted) {
        if (tokenStarted) {
          tokens.push(current);
          current = '';
          tokenStarted = false;
        }
        continue;
      }

      current += character;
      tokenStarted = true;
    }

    if (quoted) {
      throw new CommandSyntaxError('unclosed double quote');
    }
    if (tokenStarted) {
      tokens.push(current);
    }

    return tokens;
  }
}
