import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import ts from 'typescript';

const baseline = process.argv[2] ?? 'final';
const target = process.argv[3] ?? 'HEAD';
const output = process.argv[4] ?? 'docs/metrics/current';
const git = (...args) => execFileSync('git', args, { encoding:'utf8', maxBuffer:32*1024*1024 });
function snapshot(ref) {
  const files = git('ls-tree','-r','--name-only',ref).trim().split('\n').filter(p=> /\.ts$/.test(p) && (p.startsWith('src/') || p.startsWith('extensions/svg-tools/src/')));
  return files.map(path => {
    const source = git('show',ref+':'+path).replace(/\r\n/g,'\n');
    const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
    let decisions=0, functions=0;
    const classes=[];
    function visit(n) {
      if (ts.isClassDeclaration(n) && n.name) classes.push(n.name.text);
      if (ts.isFunctionLike(n) && n.body) functions++;
      if (ts.isIfStatement(n)||ts.isForStatement(n)||ts.isForOfStatement(n)||ts.isForInStatement(n)||ts.isWhileStatement(n)||ts.isDoStatement(n)||ts.isCatchClause(n)||ts.isConditionalExpression(n)||ts.isCaseClause(n)) decisions++;
      if (ts.isBinaryExpression(n) && [ts.SyntaxKind.AmpersandAmpersandToken,ts.SyntaxKind.BarBarToken,ts.SyntaxKind.QuestionQuestionToken].includes(n.operatorToken.kind)) decisions++;
      ts.forEachChild(n,visit);
    }
    visit(ast);
    const category=path.startsWith('extensions/')?'vscode':path.startsWith('src/plugins/')?'plugins':path.startsWith('src/bootstrap/')?'assembly':'kernel';
    const role={kernel:'领域、应用或 IO/CLI 适配（依所在目录）',assembly:'宿主启动及插件装配',plugins:'插件能力实现',vscode:'独立 VSCode 插件实践'}[category];
    return {path,category,classes,role,lines:source.split('\n').length-(source.endsWith('\n')?1:0),complexity:functions+decisions,functions,decisions};
  });
}
const before=snapshot(baseline),after=snapshot(target);
const totals=rows=>Object.fromEntries(['kernel','assembly','plugins','vscode'].map(c=>[c,rows.filter(r=>r.category===c).reduce((a,r)=>({files:a.files+1,lines:a.lines+r.lines,complexity:a.complexity+r.complexity}),{files:0,lines:0,complexity:0})]));
const result={baseline:{ref:baseline,sha:git('rev-parse',baseline).trim(),totals:totals(before)},target:{ref:target,sha:git('rev-parse',target).trim(),totals:totals(after)},method:'TypeScript AST: function baseline + if/loop/catch/case/conditional/&&/||/?? decisions; comments and strings excluded. Includes CLI production TypeScript only; VSCode separately; excludes tests, dependencies and build products.',before,after};
result.delta=Object.fromEntries(Object.keys(result.target.totals).map(c=>[c,{lines:result.target.totals[c].lines-result.baseline.totals[c].lines,complexity:result.target.totals[c].complexity-result.baseline.totals[c].complexity}]));
await mkdir(output,{recursive:true});
await writeFile(output+'/metrics.json',JSON.stringify(result,null,2)+'\n');
await writeFile(output+'/files.md','# Git 历史生成的文件清单与职责\n\n目标 '+result.target.sha+'；基线 '+result.baseline.sha+'。职责是目录角色与实际类名索引，详细行为见实验报告。\n\n| 文件 | 分类 | 类 | 职责 | 行数 | 圈复杂度 |\n|---|---|---|---|---:|---:|\n'+after.map(r=>'| '+r.path+' | '+r.category+' | '+r.classes.join(', ')+' | '+r.role+' | '+r.lines+' | '+r.complexity+' |').join('\n')+'\n');
console.log(JSON.stringify({baseline:result.baseline,target:result.target,delta:result.delta},null,2));
