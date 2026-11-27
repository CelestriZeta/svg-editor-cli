import { mkdtemp,mkdir,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,dirname,basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DirCommand } from '../../src/plugins/dir/DirCommand.js';
import { DirPlugin } from '../../src/plugins/dir/DirPlugin.js';
import { DirectoryEntry } from '../../src/application/ports/DirectoryEntry.js';
import { NodeDirectoryAccess } from '../../src/infrastructure/NodeDirectoryAccess.js';
import { PresentedCommandResult } from '../../src/application/commands/results/PresentedCommandResult.js';
import { ApplicationHarness } from '../support/ApplicationHarness.js';
import { RecordingDocumentStore } from '../support/RecordingDocumentStore.js';

describe('dir plugin and directory adapter', () => {
  it('sorts mixed and hidden entries stably without modifying source', async () => {
    const entries=[new DirectoryEntry('z',false),new DirectoryEntry('b',true),new DirectoryEntry('.hidden',false),new DirectoryEntry('a',true)];
    const command=new DirCommand({currentPath:()=>'/fixed',entries:async()=>entries});
    const result=await command.execute();
    expect(result).toBeInstanceOf(PresentedCommandResult);
    expect((result as PresentedCommandResult<unknown>).text).toBe('[DIR]  a\n[DIR]  b\n[FILE]  .hidden\n[FILE]  z');
    expect((await command.execute() as PresentedCommandResult<unknown>).text).toBe((result as PresentedCommandResult<unknown>).text);
    expect(entries[0]?.name).toBe('z');
  });
  it('works before init, handles empty/failure and preserves document and redo', async () => {
    const h=await ApplicationHarness.create(new RecordingDocumentStore()); let fail=false;
    await h.plugins.activate('dir',new DirPlugin({directory:{currentPath:()=>'/fixed',entries:async()=>{if(fail)throw Error();return [];}}}));
    expect(await h.repl.executeLine('dir')).toBe('(empty directory)');
    expect(await h.repl.executeLine('dir x')).toBe('error: dir takes no arguments');
    await h.repl.executeLine('init');await h.repl.executeLine('create rect r 0 0 1 1');await h.repl.executeLine('undo');
    const before=await h.repl.executeLine('tree');
    for(const value of [false,true]) {fail=value;expect(await h.repl.executeLine('dir')).toBe(value?'error: cannot read directory: /fixed':'(empty directory)');expect(h.history.redoCount()).toBe(1);expect(await h.repl.executeLine('tree')).toBe(before);}
    expect(await h.repl.executeLine('redo')).toBe('rect#r created');
  });
  it('combines command with real filesystem adapter', async () => {
    const root=await mkdtemp(join(tmpdir(),'svg-dir-'));
    try {
      await mkdir(join(root,'docs'));await writeFile(join(root,'.hidden'),'');await writeFile(join(root,'demo.svg'),'');
      const adapter=new NodeDirectoryAccess();const cwd=adapter.currentPath();
      const result=await new DirCommand({currentPath:()=>root,entries:p=>adapter.entries(p)}).execute();
      expect((result as PresentedCommandResult<unknown>).text).toBe('[DIR]  docs\n[FILE]  .hidden\n[FILE]  demo.svg');
      expect(adapter.currentPath()).toBe(cwd);
      expect((await new DirCommand({currentPath:()=>join(root,'absent'),entries:p=>adapter.entries(p)}).execute()).succeeded).toBe(false);
    } finally {if(dirname(root)!==tmpdir()||!basename(root).startsWith('svg-dir-'))throw Error('unsafe cleanup');await rm(root,{recursive:true,force:true});}
  });
});
