import { describe, expect, it } from 'vitest';

import { CommandExecutor } from '../../src/application/CommandExecutor.js';
import { CommandHistory } from '../../src/application/CommandHistory.js';
import { ErrorResult } from '../../src/application/commands/results/ErrorResult.js';
import { HelpResult } from '../../src/application/commands/results/HelpResult.js';
import { OutputFormatter } from '../../src/cli/OutputFormatter.js';
import { ShapeFormatter } from '../../src/cli/ShapeFormatter.js';
import { ShowFormatter } from '../../src/cli/ShowFormatter.js';
import { TreeFormatter } from '../../src/cli/TreeFormatter.js';
import { ControlledCommand } from '../support/ControlledCommand.js';
import { ThrowingCommand } from '../support/ThrowingCommand.js';

describe('CommandExecutor', () => {
  it('[CLI-08] does not expose an unexpected implementation error', async () => {
    const executor = new CommandExecutor(new CommandHistory());
    const shapes = new ShapeFormatter();
    const formatter = new OutputFormatter(
      new TreeFormatter(shapes),
      new ShowFormatter(shapes)
    );
    const result = await executor.execute(
      new ThrowingCommand('private implementation detail')
    );

    expect(result).toBeInstanceOf(ErrorResult);
    expect(formatter.format(result)).toBe('error: command failed');
    expect((result as ErrorResult).cause).toBeInstanceOf(Error);
  });

  it('[EXEC-01] serializes commands and waits for the previous operation', async () => {
    const events: string[] = [];
    let releaseFirst: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const executor = new CommandExecutor(new CommandHistory());
    const first = executor.execute(
      new ControlledCommand(async () => {
        events.push('first:start');
        await gate;
        events.push('first:end');
        return new HelpResult([]);
      })
    );
    await Promise.resolve();
    const second = executor.execute(
      new ControlledCommand(async () => {
        events.push('second:start');
        return new HelpResult([]);
      })
    );

    expect(events).toEqual(['first:start']);
    releaseFirst?.();
    await Promise.all([first, second]);
    expect(events).toEqual(['first:start', 'first:end', 'second:start']);
  });
});
