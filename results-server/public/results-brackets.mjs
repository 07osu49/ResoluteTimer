import {placeholder,winner} from './results-core.mjs';
export function placementGames(games,division){return games.filter(g=>(!division||g.division===division)&&(placeholder(g.team1)||placeholder(g.team2)))}
export function bracketParticipant(games,results,game,side){
 const reported=results[game.id];if(reported)return reported['team'+side];
 const label=game['team'+side],match=/^Bracket Winner\s+(\S+)$/i.exec(label);
 if(!match)return label;
 const feeder=games.find(g=>g.division===game.division&&g.code===match[1]);
 const team=feeder&&winner(results[feeder.id]);return team&&team!=='Tie'?team:label;
}
export function bracketGroups(games,division){
 const selected=placementGames(games,division),edges=[];
 for(const game of selected)for(const side of[1,2]){
  const match=/^Bracket Winner\s+(\S+)$/i.exec(game['team'+side]);if(!match)continue;
  const source=selected.find(g=>g.division===game.division&&g.code===match[1]);
  if(source)edges.push({from:source.id,to:game.id,side});
 }
 const remaining=new Set(selected.map(g=>g.id)),groups=[],singles=[];
 while(remaining.size){
  const ids=new Set([remaining.values().next().value]);let changed=true;
  while(changed){changed=false;for(const e of edges)if(ids.has(e.from)||ids.has(e.to))for(const id of[e.from,e.to])if(!ids.has(id)){ids.add(id);changed=true}}
  for(const id of ids)remaining.delete(id);
  const nodes=selected.filter(g=>ids.has(g.id)),links=edges.filter(e=>ids.has(e.from)&&ids.has(e.to));
  if(!links.length){singles.push(...nodes);continue}
  const rounds=new Map(nodes.map(g=>[g.id,0]));
  for(let pass=0;pass<nodes.length;pass++)for(const e of links)rounds.set(e.to,Math.max(rounds.get(e.to),rounds.get(e.from)+1));
  const columns=Array.from({length:Math.max(...rounds.values())+1},(_,i)=>nodes.filter(g=>rounds.get(g.id)===i));
  const height=Math.max(...columns.map(c=>c.length))*210;
  const positioned=columns.flatMap((column,round)=>column.map((game,row)=>({game,round,x:round*330,y:(row+.5)*height/column.length-90})));
  groups.push({nodes:positioned,edges:links,width:columns.length*330-60,height});
 }
 return{paths:groups,singles};
}
