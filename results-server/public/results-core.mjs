export const divisions=['5th/6th Grade','Middle School','High School Varsity Red','High School Varsity Black','High School JV'];
export const key=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export const placeholder=s=>/^(?:BLACK|RED)\s+\d+(?:st|nd|rd|th)\s+Place$|^Bracket Winner\b/i.test(s);
export function winner(result){if(!result)return null;return result.score1===result.score2?'Tie':result.score1>result.score2?result.team1:result.team2}
export function roster(games,division){return [...new Set(games.filter(g=>g.division===division).flatMap(g=>[g.team1,g.team2]).filter(t=>!placeholder(t)))].sort((a,b)=>a.localeCompare(b))}
export function normalizeReport(payload,games){
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
export function standings(games,results,division){
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
