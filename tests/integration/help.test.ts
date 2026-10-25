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
        '  read <file.svg>',
        '  create <rect|circle|ellipse|line|text|g> <id> [params...] [in <container-id>]',
        '  delete <id>',
        '  move <id> <dx> <dy>',
        '  scale <id> <factor>',
        '  set <id> <attribute> <value>',
        '  group <new-gid> <id1> <id2>...',
        '  ungroup <gid>',
        '  addto <gid> <id>',
        '  front <id>',
        '  back <id>',
        '  tree [id]',
        '  show <id>',
        '  undo',
        '  redo',
        '  save [file.svg]',
        '  canvas [w] [h]',
        '  help'
      ].join('\n')
    );
  });
});
