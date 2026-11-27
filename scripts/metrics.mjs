import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import * as ts from 'typescript/unstable/ast';
import { API } from 'typescript/unstable/sync';
import { createVirtualFileSystem } from 'typescript/unstable/fs';
import { resolve } from 'node:path';

const baseline = process.argv[2] ?? 'final';
const target = process.argv[3] ?? 'HEAD';
const output = process.argv[4] ?? 'docs/metrics/current';
const git = (...args) => execFileSync('git', args, { encoding:'utf8', maxBuffer:32*1024*1024 });
function snapshot(ref) {
  const files = git('ls-tree','-r','--name-only',ref).trim().split('\n').filter(p=> /\.ts$/.test(p) && (p.startsWith('src/') || p.startsWith('extensions/svg-tools/src/')));
  const root = resolve('.metrics-virtual').replaceAll('\\','/');
  const sources = Object.fromEntries(files.map(p => [p, git('show',ref+':'+p).replace(/\r\n/g,'\n')]));
  const virtual = Object.fromEntries(files.map(p=>[root+'/'+p,sources[p]]));
  const config = root+'/tsconfig.json';
  virtual[config] = JSON.stringify({compilerOptions:{noLib:true,noResolve:true},files:files});
  const api = new API({cwd:root,fs:createVirtualFileSystem(virtual)});
  const snap = api.updateSnapshot({openProjects:[config]});
  const program = snap.getProject(config).program;
  const rows = files.map(path => {
    const source = sources[path];
    const ast = program.getSourceFile(root+'/'+path);
    if (!ast) throw new Error('missing AST: '+path);
    let decisions=0, functions=0;
    const classes=[], methods=[];
    function visit(n) {
      if ((ts.isMethodDeclaration(n) || ts.isGetAccessorDeclaration(n) || ts.isSetAccessorDeclaration(n) || n.kind===ts.SyntaxKind.MethodSignature) && n.name && !n.modifiers?.some(m=>m.kind===ts.SyntaxKind.PrivateKeyword)) methods.push(n.name.text ?? source.slice(n.name.pos,n.name.end).trim());
      if (ts.isClassDeclaration(n) && n.name) classes.push(n.name.text);
      if ([ts.SyntaxKind.FunctionDeclaration,ts.SyntaxKind.FunctionExpression,ts.SyntaxKind.ArrowFunction,ts.SyntaxKind.MethodDeclaration,ts.SyntaxKind.Constructor,ts.SyntaxKind.GetAccessor,ts.SyntaxKind.SetAccessor].includes(n.kind) && n.body) functions++;
      if (ts.isIfStatement(n)||ts.isForStatement(n)||ts.isForOfStatement(n)||ts.isForInStatement(n)||ts.isWhileStatement(n)||ts.isDoStatement(n)||ts.isCatchClause(n)||ts.isConditionalExpression(n)||ts.isCaseClause(n)) decisions++;
      if (ts.isBinaryExpression(n) && [ts.SyntaxKind.AmpersandAmpersandToken,ts.SyntaxKind.BarBarToken,ts.SyntaxKind.QuestionQuestionToken].includes(n.operatorToken.kind)) decisions++;
      n.forEachChild(visit);
    }
    visit(ast);
    const category=path.startsWith('extensions/')?'vscode':path.startsWith('src/plugins/')?'plugins':path.startsWith('src/bootstrap/')?'assembly':'kernel';
    const role={kernel:path.startsWith('src/domain/document/')?'文档聚合、结构规划和树关系':path.startsWith('src/domain/shapes/')?'图形状态与可撤销变更':path.startsWith('src/domain/specs/')?'类型化图形创建规格':path.startsWith('src/domain/')?'领域校验、遍历和事务':path.startsWith('src/application/extensions/')?'扩展契约与注册事务':path.startsWith('src/application/ports/')?'宿主与 IO 端口契约':path.startsWith('src/application/queries/')?'只读查询投影':path.startsWith('src/application/commands/results/')?'命令语义结果':path.startsWith('src/application/commands/')?'命令执行契约与守卫':path.startsWith('src/application/')?'会话、历史与应用协调':path.startsWith('src/cli/')?'终端输入与输出适配':'SVG/XML 与文件系统适配',assembly:'宿主启动及插件装配',plugins:'插件能力实现',vscode:'独立 VSCode 插件实践'}[category];
    const responsibilities = role + (methods.length ? '；行为入口：' + [...new Set(methods)].join(', ') : '；' + (classes.join(', ') || path.split('/').at(-1)));
    return {path,category,classes,role:responsibilities,lines:source.split('\n').length-(source.endsWith('\n')?1:0),complexity:functions+decisions,functions,decisions};
  });
  snap.dispose(); api.close();
  return rows;
}
const before=snapshot(baseline),after=snapshot(target);
const totals=rows=>Object.fromEntries(['kernel','assembly','plugins','vscode'].map(c=>[c,rows.filter(r=>r.category===c).reduce((a,r)=>({files:a.files+1,lines:a.lines+r.lines,complexity:a.complexity+r.complexity}),{files:0,lines:0,complexity:0})]));
const result={baseline:{ref:baseline,sha:git('rev-parse',baseline).trim(),totals:totals(before)},target:{sourceTreeSha256:createHash('sha256').update(git('ls-tree','-r',target,'--','src','extensions/svg-tools/src')).digest('hex'),totals:totals(after)},method:'TypeScript AST: function baseline + if/loop/catch/case/conditional/&&/||/?? decisions; comments and strings excluded. Includes CLI production TypeScript only; VSCode separately; excludes tests, dependencies and build products.',before,after};
result.delta=Object.fromEntries(Object.keys(result.target.totals).map(c=>[c,{lines:result.target.totals[c].lines-result.baseline.totals[c].lines,complexity:result.target.totals[c].complexity-result.baseline.totals[c].complexity}]));
await mkdir(output,{recursive:true});
await writeFile(output+'/metrics.json',JSON.stringify(result,null,2)+'\n');
await writeFile(output+'/files.md','# Git 历史生成的文件清单与职责\n\n目标源码树 SHA-256 '+result.target.sourceTreeSha256+'；基线 '+result.baseline.sha+'。职责是目录角色与实际类名索引，详细行为见实验报告。\n\n| 文件 | 分类 | 类 | 职责 | 行数 | 圈复杂度 |\n|---|---|---|---|---:|---:|\n'+after.map(r=>'| '+r.path+' | '+r.category+' | '+r.classes.join(', ')+' | '+r.role+' | '+r.lines+' | '+r.complexity+' |').join('\n')+'\n');
console.log(JSON.stringify({generatedFrom:{ref:target,sha:git('rev-parse',target).trim()},baseline:result.baseline,target:result.target,delta:result.delta},null,2));

await writeFile(output+'/summary.md','# 自动生成的指标对比\n\n基线 '+result.baseline.sha+'；目标源码树 '+result.target.sourceTreeSha256+'。物理行数含空行和注释；复杂度按函数基数加 AST 决策计数，VSCode 单列。\n\n| 分类 | 基线文件 | 目标文件 | 基线行数 | 目标行数 | 行数增量 | 基线复杂度 | 目标复杂度 | 复杂度增量 |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|\n'+Object.keys(result.target.totals).map(c=>{const b=result.baseline.totals[c],a=result.target.totals[c];return '| '+[c,b.files,a.files,b.lines,a.lines,a.lines-b.lines,b.complexity,a.complexity,a.complexity-b.complexity].join(' | ')+' |';}).join('\n')+'\n');
