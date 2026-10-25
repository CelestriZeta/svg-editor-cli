import { createInterface } from 'node:readline';
import { PassThrough } from 'node:stream';

import { describe, expect, it, vi } from 'vitest';

import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

describe('REPL stream', () => {
  it('[CLI-01/02/06] writes the banner and processes script lines in order', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const output: string[] = [];
    const lines = async function* (): AsyncGenerator<string> {
      yield '';
      yield '# ignored comment';
      yield 'init 10 20';
      yield 'create rect r1 -1.5 2.25 3.5 4.5 red';
      yield 'tree';
    };

    await harness.repl.run(lines(), (text) => output.push(text));

    expect(output.join('')).toBe(
      [
        "svg-editor 0.1 - type 'help' for commands",
        'canvas 10x20 created',
        'rect#r1 created',
        'svg (10x20)',
        '└── rect#r1        x=-1.5 y=2.25 w=3.5 h=4.5 fill=red',
        ''
      ].join('\n')
    );
  });

  it('[CLI-01] writes the svg prompt in interactive mode', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const output: string[] = [];
    const lines = async function* (): AsyncGenerator<string> {
      yield 'init 10 20';
      yield 'canvas';
    };

    await harness.repl.run(
      lines(),
      (text) => output.push(text),
      { prompt: () => output.push('svg> ') }
    );

    expect(output.join('')).toBe(
      [
        "svg-editor 0.1 - type 'help' for commands",
        'svg> canvas 10x20 created',
        'svg> canvas 10x20',
        'svg> ',
        ''
      ].join('\n')
    );
  });

  it('keeps the readline prompt when backspacing at the start and within input', async () => {
    vi.stubEnv('TERM', 'xterm');
    const harness = new ApplicationHarness(new RecordingDocumentStore());
    const input = new PassThrough();
    const output = new PassThrough();
    const terminalOutput: string[] = [];
    output.on('data', (chunk: Buffer) => terminalOutput.push(chunk.toString()));
    const lines = createInterface({ input, output, terminal: true, prompt: 'svg> ' });
    const results: string[] = [];
    const emptyInputStates: { line: string; rows: number; cols: number }[] = [];
    let prompts = 0;

    try {
      await harness.repl.run(lines, (text) => results.push(text), {
        prompt: () => {
          lines.prompt();
          prompts += 1;
          queueMicrotask(() => {
            if (prompts === 1) {
              input.write('\x7f');
              input.write('\b');
              emptyInputStates.push({ line: lines.line, ...lines.getCursorPos() });
              for (const key of 'init 10 21\x7f0\r') input.write(key);
            } else if (prompts === 2) {
              for (const key of 'x\x7f\x7f') input.write(key);
              emptyInputStates.push({ line: lines.line, ...lines.getCursorPos() });
              for (const key of 'canvas\r') input.write(key);
            } else {
              lines.close();
            }
          });
        }
      });

      expect(results.join('')).toContain('canvas 10x20 created\ncanvas 10x20\n');
      expect(terminalOutput.join('')).toContain('\x1b[1G\x1b[0Jsvg> ');
      expect(prompts).toBe(3);
      expect(emptyInputStates).toEqual([
        { line: '', rows: 0, cols: 5 },
        { line: '', rows: 0, cols: 5 }
      ]);
    } finally {
      lines.close();
      input.destroy();
      output.destroy();
      vi.unstubAllEnvs();
    }
  });
});
