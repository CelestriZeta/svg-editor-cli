import { describe, expect, it } from 'vitest';

import { CommandExecutor } from '../../src/application/CommandExecutor.js';
import { CommandHistory } from '../../src/application/CommandHistory.js';
import { ErrorResult } from '../../src/application/commands/results/ErrorResult.js';
import { OutputFormatter } from '../../src/cli/OutputFormatter.js';
import { TreeFormatter } from '../../src/cli/TreeFormatter.js';
import { ThrowingCommand } from '../support/ThrowingCommand.js';

describe('CommandExecutor', () => {
  it('[CLI-08] does not expose an unexpected implementation error', async () => {
    const executor = new CommandExecutor(new CommandHistory());
    const formatter = new OutputFormatter(new TreeFormatter());
    const result = await executor.execute(
      new ThrowingCommand('private implementation detail')
    );

    expect(result).toBeInstanceOf(ErrorResult);
    expect(formatter.format(result)).toBe('error: command failed');
    expect((result as ErrorResult).cause).toBeInstanceOf(Error);
  });
});
