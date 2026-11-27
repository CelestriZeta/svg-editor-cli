import { expect,it } from 'vitest';
import { DirPlugin } from '../../src/plugins/dir/DirPlugin.js';
import type { CommandContribution } from '../../src/application/extensions/CommandContribution.js';
import { DirectoryEntry } from '../../src/application/ports/DirectoryEntry.js';
import { PresentedCommandResult } from '../../src/application/commands/results/PresentedCommandResult.js';
it('dir activates and executes against a filesystem substitute without other plugins',async()=>{
  const commands:CommandContribution[]=[];const unexpected=():never=>{throw Error('unexpected registration');};
  new DirPlugin({directory:{currentPath:()=>'/fixture',entries:async()=>[new DirectoryEntry('file',false),new DirectoryEntry('.directory',true)]}})
    .activate({registerCommand:c=>commands.push(c),registerShape:unexpected,registerAttribute:unexpected,registerDecorator:unexpected});
  expect(commands.map(c=>c.name)).toEqual(['dir']);
  expect((await commands[0]!.create([]).execute() as PresentedCommandResult<unknown>).text).toBe('[DIR]  .directory\n[FILE]  file');
});
