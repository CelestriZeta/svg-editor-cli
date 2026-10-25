import { describe, expect, it } from 'vitest';

import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

describe('help', () => {
  it('[CMD-04] derives help from the same definitions used by dispatch', async () => {
    const harness = new ApplicationHarness(new RecordingDocumentStore());

    expect(await harness.repl.executeLine('help')).toBe(
      [
        'commands:',
        '  init [w] [h]',
        '  create rect <id> <x> <y> <width> <height> [fill]',
        '  tree',
        '  save [file.svg]',
        '  help'
      ].join('\n')
    );
  });
});
