const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'../web/dist/app.js'),'utf8');
let now=0,next=0;const timers=new Map(),buttons={},win={},doc={};
const state={remain:20,running:true};
const add=(fn,ms,interval)=>{const id=++next;timers.set(id,{fn,at:now+ms,ms,interval});return id};
const tick=ms=>{const end=now+ms;for(;;){let entry=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!entry)break;const[id,t]=entry;now=t.at;if(t.interval)t.at+=t.ms;else timers.delete(id);t.fn()}now=end};
const c=vm.createContext({state,act:fn=>fn(),$:id=>buttons[id]??=( {setPointerCapture(){}} ),setTimeout:(f,m)=>add(f,m,false),setInterval:(f,m)=>add(f,m,true),clearTimeout:id=>timers.delete(id),clearInterval:id=>timers.delete(id),window:{addEventListener:(k,f)=>win[k]=f},document:{hidden:false,addEventListener:(k,f)=>doc[k]=f}});
vm.runInContext(code.slice(code.indexOf('let stopClockAdjustment='),code.indexOf("$('#start').onclick=")),c);
const minus=buttons['#game-minus'],plus=buttons['#game-plus'];
const e=(extra={})=>({button:0,isPrimary:true,pointerId:1,preventDefault(){},...extra});
plus.onpointerdown(e());plus.onpointerup(e());plus.onclick({detail:1});assert.equal(state.remain,21);tick(1000);assert.equal(state.remain,21);
plus.onpointerdown(e());tick(399);assert.equal(state.remain,22);tick(1);assert.equal(state.remain,23);tick(300);assert.equal(state.remain,26);plus.onpointerup(e());tick(500);assert.equal(state.remain,26);
minus.onkeydown(e({key:'Enter'}));minus.onkeydown(e({key:'Enter',repeat:true}));tick(500);assert.equal(state.remain,23);minus.onkeyup(e({key:'Enter'}));tick(500);assert.equal(state.remain,23);
plus.onclick({detail:0});assert.equal(state.remain,24);
for(const stop of [()=>plus.onpointercancel(e()),()=>plus.onlostpointercapture(),()=>plus.onpointerleave(),()=>plus.onblur(),()=>win.blur(),()=>win.pagehide(),()=>{c.document.hidden=true;doc.visibilitychange();c.document.hidden=false}]){
 plus.onpointerdown(e());const expected=state.remain;stop();tick(1000);assert.equal(state.remain,expected);
}
state.remain=1;minus.onpointerdown(e());tick(600);assert.equal(state.remain,0);assert.equal(state.running,false);minus.onpointerup(e());
plus.onpointerdown(e());minus.onpointerdown(e({pointerId:2}));tick(500);assert.equal(state.remain,0);minus.onpointerup(e({pointerId:2}));assert.equal(timers.size,0);
const scores=[3,7];c.scores=scores;
vm.runInContext("for(const side of[1,2])for(const[direction,delta]of[['plus',1],['minus',-1]])bindHeldAdjustment($('#score'+side+'-'+direction),()=>{scores[side-1]=Math.max(0,scores[side-1]+delta);$('#score'+side+'-'+direction).disabled=delta<0&&scores[side-1]===0})",c);
const up=buttons['#score1-plus'],down=buttons['#score1-minus'],other=buttons['#score2-plus'];
up.onpointerdown(e());tick(600);up.onpointerup(e());up.onclick({detail:1});assert.equal(scores[0],7);assert.equal(scores[1],7);
down.onpointerdown(e());tick(2000);assert.equal(scores[0],0);assert.equal(timers.size,0);down.onpointerup(e());tick(500);assert.equal(scores[0],0);
other.onkeydown(e({key:' '}));tick(500);other.onkeyup(e({key:' '}));assert.equal(scores[1],10);tick(500);assert.equal(scores[1],10);
other.onpointerdown(e());win.blur();const saved=scores[1];tick(500);assert.equal(scores[1],saved);
console.log('PASS: score holds, independent teams, floor, disabled stop, keyboard and blur');
console.log('PASS: Game Clock tap, hold repeat, release, keyboard, assistive click, cancellation, backgrounding, switch and zero floor');
