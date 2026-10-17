(()=>{
const divisions=['5th/6th Grade','Middle School','High School Varsity Red','High School Varsity Black','High School JV'];
const key=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const placeholder=s=>/^(?:BLACK|RED)\s+\d+(?:st|nd|rd|th)\s+Place$|^Bracket Winner\b/i.test(s);
function winner(result){if(!result)return null;return result.score1===result.score2?'Tie':result.score1>result.score2?result.team1:result.team2}
function roster(games,division){return [...new Set(games.filter(g=>g.division===division).flatMap(g=>[g.team1,g.team2]).filter(t=>!placeholder(t)))].sort((a,b)=>a.localeCompare(b))}
function normalizeReport(payload,games){
 if(!payload||typeof payload!=='object')throw Error('A score report is required.');
 if(!/^[a-zA-Z0-9-]{10,100}$/.test(payload.submissionId||''))throw Error('Invalid report identifier.');
 const game=games.find(g=>g.id===payload.gameId||(!payload.gameId&&g.field===Number(payload.field)&&g.time===payload.time));
 if(!game)throw Error('This field and time are not on the Sixes Showdown schedule.');
 const scores=[payload.score1,payload.score2];if(scores.some(n=>!Number.isInteger(n)||n<0||n>999))throw Error('Scores must be whole numbers from 0 to 999.');
 const names=[payload.team1,payload.team2].map(t=>String(t||'').trim());if(names.some(t=>!t||t.length>120||placeholder(t)))throw Error('Select the actual team names before reporting a bracket game.');
 const expected=[game.team1,game.team2],teams=roster(games,game.division);
 const resolve=(name,expected)=>placeholder(expected)?teams.find(t=>key(t)===key(name)):(key(name)===key(expected)?expected:null);
 let team1=resolve(names[0],expected[0]),team2=resolve(names[1],expected[1]),score1=scores[0],score2=scores[1];
 if(!team1||!team2){team1=resolve(names[1],expected[0]);team2=resolve(names[0],expected[1]);score1=scores[1];score2=scores[0]}
 if(!team1||!team2||key(team1)===key(team2))throw Error('Team names do not match this scheduled game or its division. Open Results to record the correct game.');
 return {submissionId:payload.submissionId,gameId:game.id,team1,team2,score1,score2,source:payload.source==='results'?'results':'sideline'};
}
function standings(games,results,division){
 const teams=new Map(roster(games,division).map(team=>[key(team),{team,played:0,wins:0,losses:0,ties:0,gf:0,ga:0,diff:0}]));
 for(const game of games.filter(g=>g.division===division)){
  const r=results[game.id];if(!r)continue;
  for(const [team,opponent,a,b]of [[r.team1,r.team2,r.score1,r.score2],[r.team2,r.team1,r.score2,r.score1]]){
   if(placeholder(team)||placeholder(opponent))continue;
   let t=teams.get(key(team));if(!t){t={team,played:0,wins:0,losses:0,ties:0,gf:0,ga:0,diff:0};teams.set(key(team),t)}
   t.played++;t.gf+=a;t.ga+=b;t.diff=t.gf-t.ga;if(a>b)t.wins++;else if(a<b)t.losses++;else t.ties++;
  }
 }
 return [...teams.values()].sort((a,b)=>b.wins-a.wins||b.diff-a.diff||b.gf-a.gf||a.team.localeCompare(b.team));
}

const scheduleGames=[{"id":"2026-10-18:5:08:40","code":"P1","division":"5th/6th Grade","time":"08:40","field":5,"team1":"House Team Red","team2":"House Team White"},{"id":"2026-10-18:2:08:40","code":"P2","division":"Middle School","time":"08:40","field":2,"team1":"McCord/Perry MS","team2":"Liberty MS"},{"id":"2026-10-18:3:08:40","code":"P3","division":"Middle School","time":"08:40","field":3,"team1":"East Side All Stars","team2":"Worthington Cardinals"},{"id":"2026-10-18:4:09:00","code":"P2","division":"High School Varsity Red","time":"09:00","field":4,"team1":"Columbus Landsharks","team2":"Olentangy Arrows"},{"id":"2026-10-18:1:09:00","code":"P5","division":"High School Varsity Red","time":"09:00","field":1,"team1":"St. Francis De Sales (Tol)","team2":"Thomas Worthington"},{"id":"2026-10-18:5:09:20","code":"P4","division":"High School Varsity Red","time":"09:20","field":5,"team1":"Olentangy Braves","team2":"Gahanna"},{"id":"2026-10-18:1:09:40","code":"P1","division":"Middle School","time":"09:40","field":1,"team1":"Worthington Cardinals","team2":"Olentangy Berkshire MS"},{"id":"2026-10-18:2:09:40","code":"P3","division":"High School Varsity Red","time":"09:40","field":2,"team1":"St. Charles","team2":"St. Johns"},{"id":"2026-10-18:3:09:40","code":"P4","division":"Middle School","time":"09:40","field":3,"team1":"Olentangy Hyatts MS","team2":"McCord/Perry MS"},{"id":"2026-10-18:5:10:00","code":"P1","division":"High School Varsity Red","time":"10:00","field":5,"team1":"Thomas Worthington","team2":"TEAM CLE"},{"id":"2026-10-18:4:10:00","code":"P9","division":"High School Varsity Red","time":"10:00","field":4,"team1":"Columbus Landsharks","team2":"St. Francis De Sales (Tol)"},{"id":"2026-10-18:3:10:20","code":"P1","division":"High School Varsity Black","time":"10:20","field":3,"team1":"Dublin Jerome","team2":"Desales (Cbus)"},{"id":"2026-10-18:2:10:20","code":"P4","division":"High School Varsity Black","time":"10:20","field":2,"team1":"Delaware Hayes","team2":"Bishop Watterson"},{"id":"2026-10-18:1:10:20","code":"P7","division":"High School Varsity Red","time":"10:20","field":1,"team1":"Olentangy Arrows","team2":"Olentangy Braves"},{"id":"2026-10-18:4:10:40","code":"P5","division":"Middle School","time":"10:40","field":4,"team1":"Olentangy Berkshire MS","team2":"East Side All Stars"},{"id":"2026-10-18:5:10:40","code":"P6","division":"Middle School","time":"10:40","field":5,"team1":"Liberty MS","team2":"Olentangy Hyatts MS"},{"id":"2026-10-18:2:11:00","code":"P2","division":"High School JV","time":"11:00","field":2,"team1":"Dublin Jerome - JV","team2":"Worthington Kilbourne - JV"},{"id":"2026-10-18:3:11:00","code":"P6","division":"High School Varsity Red","time":"11:00","field":3,"team1":"TEAM CLE","team2":"St. Charles"},{"id":"2026-10-18:1:11:00","code":"P8","division":"High School Varsity Red","time":"11:00","field":1,"team1":"St. Johns","team2":"Gahanna"},{"id":"2026-10-18:4:11:20","code":"P2","division":"High School Varsity Black","time":"11:20","field":4,"team1":"Bishop Watterson","team2":"St. Ignatius"},{"id":"2026-10-18:5:11:20","code":"P5","division":"High School Varsity Black","time":"11:20","field":5,"team1":"Desales (Cbus)","team2":"St. Edwards"},{"id":"2026-10-18:1:11:40","code":"B1","division":"Middle School","time":"11:40","field":1,"team1":"BLACK 1st Place","team2":"RED 1st Place"},{"id":"2026-10-18:2:11:40","code":"B2","division":"Middle School","time":"11:40","field":2,"team1":"BLACK 2nd Place","team2":"RED 2nd Place"},{"id":"2026-10-18:3:11:40","code":"B4","division":"Middle School","time":"11:40","field":3,"team1":"BLACK 3rd Place","team2":"RED 3rd Place"},{"id":"2026-10-18:4:12:00","code":"P1","division":"High School JV","time":"12:00","field":4,"team1":"The Pigeons","team2":"Northside Riptide"},{"id":"2026-10-18:5:12:00","code":"P5","division":"High School JV","time":"12:00","field":5,"team1":"Dublin Jerome - JV","team2":"Bishop Watterson JV"},{"id":"2026-10-18:2:12:20","code":"B5","division":"High School Varsity Red","time":"12:20","field":2,"team1":"BLACK 1st Place","team2":"BLACK 4th Place"},{"id":"2026-10-18:3:12:20","code":"B6","division":"High School Varsity Red","time":"12:20","field":3,"team1":"BLACK 2nd Place","team2":"BLACK 3rd Place"},{"id":"2026-10-18:1:12:20","code":"B8","division":"High School Varsity Red","time":"12:20","field":1,"team1":"BLACK 7th Place","team2":"BLACK 6th Place"},{"id":"2026-10-18:4:12:40","code":"P3","division":"High School Varsity Black","time":"12:40","field":4,"team1":"St. Edwards","team2":"Dublin Jerome"},{"id":"2026-10-18:5:12:40","code":"P6","division":"High School Varsity Black","time":"12:40","field":5,"team1":"St. Ignatius","team2":"Delaware Hayes"},{"id":"2026-10-18:1:13:00","code":"P3","division":"High School JV","time":"13:00","field":1,"team1":"Bishop Watterson JV","team2":"The Pigeons"},{"id":"2026-10-18:2:13:00","code":"P4","division":"High School JV","time":"13:00","field":2,"team1":"Northside Riptide","team2":"Worthington Kilbourne - JV"},{"id":"2026-10-18:3:13:00","code":"B4","division":"High School Varsity Red","time":"13:00","field":3,"team1":"BLACK 8th Place","team2":"BLACK 9th Place"},{"id":"2026-10-18:4:13:20","code":"B7","division":"High School Varsity Red","time":"13:20","field":4,"team1":"Bracket Winner B5","team2":"Bracket Winner B6"},{"id":"2026-10-18:5:13:20","code":"B9","division":"High School Varsity Red","time":"13:20","field":5,"team1":"BLACK 5th Place","team2":"Bracket Winner B8"},{"id":"2026-10-18:1:13:40","code":"B1","division":"High School Varsity Black","time":"13:40","field":1,"team1":"BLACK 1st Place","team2":"RED 1st Place"},{"id":"2026-10-18:2:13:40","code":"B4","division":"High School Varsity Black","time":"13:40","field":2,"team1":"BLACK 3rd Place","team2":"RED 3rd Place"},{"id":"2026-10-18:3:13:40","code":"B5","division":"High School Varsity Black","time":"13:40","field":3,"team1":"BLACK 2nd Place","team2":"RED 2nd Place"},{"id":"2026-10-18:4:14:00","code":"B1","division":"High School JV","time":"14:00","field":4,"team1":"BLACK 1st Place","team2":"BLACK 2nd Place"},{"id":"2026-10-18:5:14:00","code":"B2","division":"High School JV","time":"14:00","field":5,"team1":"BLACK 3rd Place","team2":"BLACK 4th Place"}];
(()=>{const endpoint='https://resolute-sideline.truecoot2.chatgpt.site/api/results',queueKey='resolute-score-outbox-v1',lastKey='resolute-score-sync-time';
let active=null,lastError='';const load=()=>{try{const rows=JSON.parse(localStorage.getItem(queueKey)||'[]');return Array.isArray(rows)?rows:[]}catch{return[]}};
const notify=()=>window.dispatchEvent(new CustomEvent('resolute-results-sync'));
function status(){let lastSynced=null;try{lastSynced=localStorage.getItem(lastKey)}catch{}return{pending:load().length,error:lastError,lastSynced}}
async function flush(){
 if(active)return active;
 active=(async()=>{for(const queued of load()){
  try{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);let response;
   try{response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(queued),keepalive:true,signal:controller.signal})}finally{clearTimeout(timer)}
   const data=await response.json();if(!response.ok||!data.saved)throw Error(data.error||'Unable to sync result.');
   localStorage.setItem(queueKey,JSON.stringify(load().filter(r=>r.submissionId!==queued.submissionId)));localStorage.setItem(lastKey,new Date().toISOString());lastError='';
  }catch(e){lastError=e.name==='AbortError'?'Connection timed out. Report saved on this device for retry.':e.message;break}
 }})().finally(()=>{active=null;notify()});return active;
}
function record(payload){
 const report={...payload,source:'sideline',submissionId:crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)};
 normalizeReport(report,scheduleGames);
 const rows=load();if(rows.length>=500)throw Error('The pending report queue is full. Connect to the internet and sync first.');
 localStorage.setItem(queueKey,JSON.stringify([...rows,report]));lastError='';notify();void flush();return report.submissionId;
}
window.ResoluteResultsLink={record,flush,status};
window.addEventListener('online',()=>void flush());window.addEventListener('pageshow',()=>void flush());document.addEventListener('visibilitychange',()=>{if(!document.hidden)void flush()});setInterval(()=>{if(!document.hidden&&load().length)void flush()},30000);void flush();
})();

})();
