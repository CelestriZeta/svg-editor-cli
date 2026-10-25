import { describe, expect, it } from 'vitest';

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
      { showPrompt: true }
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
});
