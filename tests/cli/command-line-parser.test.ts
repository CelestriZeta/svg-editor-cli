import { describe, expect, it } from 'vitest';

import { CommandLineParser } from '../../src/cli/CommandLineParser.js';

describe('CommandLineParser', () => {
  it('[CLI-03/04/05] preserves comments, colors and quoted paths', () => {
    const parser = new CommandLineParser();

    expect(parser.parse('   ')).toBeNull();
    expect(parser.parse('# init 1 1')).toBeNull();
    expect(parser.parse('create rect r1 0 0 1 1 #abcdef')).toEqual([
      'create',
      'rect',
      'r1',
      '0',
      '0',
      '1',
      '1',
      '#abcdef'
    ]);
    expect(parser.parse('save "dir with spaces/demo.svg"')).toEqual([
      'save',
      'dir with spaces/demo.svg'
    ]);
    expect(parser.parse('create text t1 0 0 ""')).toEqual([
      'create',
      'text',
      't1',
      '0',
      '0',
      ''
    ]);
    expect(parser.parse('create text t2 0 0 "value # not a comment"')).toEqual([
      'create',
      'text',
      't2',
      '0',
      '0',
      'value # not a comment'
    ]);
    expect(parser.parse('create rect r2 -1.5 +2.25 3.5e1 .5')).toEqual([
      'create',
      'rect',
      'r2',
      '-1.5',
      '+2.25',
      '3.5e1',
      '.5'
    ]);
    expect(parser.parse('   # not a comment')).toEqual([
      '#',
      'not',
      'a',
      'comment'
    ]);
  });

  it('[CLI-07] rejects an unclosed quoted argument', () => {
    const parser = new CommandLineParser();

    expect(() => parser.parse('create text t1 0 0 "open')).toThrow(
      'unclosed double quote'
    );
  });
});
