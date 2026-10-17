import {readFileSync,writeFileSync,cpSync,readdirSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const parent=path.dirname(root);
const source=process.argv[2]||[path.join(parent,'dist'),path.join(parent,'web/dist')].find(p=>existsSync(path.join(p,'index.html')));
if(!source)throw Error('Timer dist directory required.');
const core=readFileSync(path.join(root,'public/results-core.mjs'),'utf8').replace(/^export /gm,'');
const schedule=JSON.parse(readFileSync(path.join(root,'lib/schedule.json'),'utf8'));
const sync='(()=>{\n'+core+'\nconst scheduleGames='+JSON.stringify(schedule.games)+';\n'+readFileSync(path.join(root,'lib/results-sync-template.js'),'utf8')+'\n})();\n';
writeFileSync(path.join(root,'public/results-sync.js'),sync);
writeFileSync(path.join(source,'results-sync.js'),sync);
writeFileSync(path.join(root,'lib/timer-html.ts'),'export const timerHtml='+JSON.stringify(readFileSync(path.join(source,'index.html'),'utf8'))+';\n');
mkdirSync(path.join(root,'public'),{recursive:true});
for(const entry of readdirSync(source,{withFileTypes:true})){
 if(['index.html','client','server','.openai','results-sync.js'].includes(entry.name))continue;
 cpSync(path.join(source,entry.name),path.join(root,'public',entry.name),{recursive:true});
}
