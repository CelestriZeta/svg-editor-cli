import { expect,it } from 'vitest';
import { StatsPlugin } from '../../src/plugins/stats/StatsPlugin.js';
import type { CommandContribution } from '../../src/application/extensions/CommandContribution.js';
import { DocumentView } from '../../src/application/queries/DocumentView.js';
import { ShapeSnapshot } from '../../src/application/queries/ShapeSnapshot.js';
import { ShapeReference } from '../../src/application/queries/ShapeReference.js';
import { GeometrySnapshot } from '../../src/application/queries/GeometrySnapshot.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { PresentedCommandResult } from '../../src/application/commands/results/PresentedCommandResult.js';
it('stats activates and traverses a fake view without loading another plugin',async()=>{
  const leaf=new ShapeSnapshot(new ShapeReference('rect','r'),GeometrySnapshot.empty());
  const group=new ShapeSnapshot(new ShapeReference('g','g'),GeometrySnapshot.empty(),undefined,undefined,undefined,undefined,[leaf],'g',true);
  const view=new DocumentView(10,10,[group]);const commands:CommandContribution[]=[];
  const unexpected=():never=>{throw Error('unexpected registration');};
  new StatsPlugin({documents:{requireDocument:()=>new SvgDocument(10,10)},query:{visit:()=>view,visitSubtree:()=>group,inspect:()=>leaf}})
    .activate({registerCommand:c=>commands.push(c),registerShape:unexpected,registerAttribute:unexpected,registerDecorator:unexpected});
  expect(commands.map(c=>c.name)).toEqual(['stats']);
  expect((await commands[0]!.create([]).execute() as PresentedCommandResult<unknown>).text).toBe('rect: 1  (total 1, containers 1)');
  expect((await commands[0]!.create(['bad']).execute()).succeeded).toBe(false);
});
