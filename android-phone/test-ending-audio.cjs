const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'../web/dist/app.js'),'utf8');
assert(code.includes("new Audio('end_of_period_buzzer.mp3')"));
const events=[],buffer={decoded:true};let now=1000,fetches=0;
const ctx={state:'running',destination:{},currentTime:0,decodeAudioData:async()=>buffer,createBufferSource:()=>({connect(){},start(){events.push('buzzer')}})};
const state={running:true,remain:.5,last:0,p:[0,0,0,0],armed:[false,false,false,false]};
const c=vm.createContext({ctx,state,buzzerBuffer:buffer,buzzerReady:null,horn:{src:'https://local.test/end_of_period_buzzer.mp3',currentTime:8,play:()=>{events.push('media');return Promise.resolve()}},fetch:async()=>{fetches++;return{ok:true,arrayBuffer:async()=>new ArrayBuffer(4)}},Date:{now:()=>now},document:{visibilityState:'visible'},beep:d=>events.push(d||0),clapMinute:()=>events.push('claps')});
vm.runInContext(code.slice(code.indexOf('function primeBuzzer(){'),code.indexOf('function unlock(){')),c);
vm.runInContext(code.slice(code.indexOf('function soundZero(game){'),code.indexOf('function act(fn){')),c);
(async()=>{
 vm.runInContext('advance(true)',c);assert.deepEqual(events,['buzzer']);assert.equal(state.remain,0);assert.equal(state.running,false);now=1100;vm.runInContext('advance(true)',c);assert.deepEqual(events,['buzzer']);
 events.length=0;vm.runInContext('soundZero(false)',c);assert.deepEqual(events,[0,.16,.32]);
 events.length=0;c.buzzerBuffer=null;vm.runInContext('soundZero(true)',c);assert.deepEqual(events,['media']);assert.equal(c.horn.currentTime,0);
 await vm.runInContext('primeBuzzer();buzzerReady',c);assert.equal(c.buzzerBuffer,buffer);await vm.runInContext('primeBuzzer();buzzerReady',c);assert.equal(fetches,1);
 c.buzzerBuffer=null;c.buzzerReady=null;c.fetch=async()=>{throw Error('offline')};await vm.runInContext('primeBuzzer();buzzerReady',c);assert.equal(c.buzzerReady,null);
 console.log('PASS: uploaded buzzer at zero once, penalty beeps retained, media fallback, cached decoding and failed-load retry');
})().catch(e=>{console.error(e);process.exitCode=1});
