import { CommandSyntaxError } from './CommandSyntaxError.js';

export class CommandLineParser {
  public parse(line: string): string[] | null {
    if (line.trim().length === 0 || line.startsWith('#')) {
      return null;
    }

    const tokens: string[] = [];
    let current = '';
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
