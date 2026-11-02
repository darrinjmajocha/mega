import test from 'node:test';
import assert from 'node:assert/strict';
import { shortcutPair, chooseFinale, teasePair, runFinale, freezeTimeline } from '../src/surprises.js';
test('Alt G guarantees exactly one green; Alt G H guarantees two',()=>{
  assert.equal(shortcutPair({alt:false,g:true,h:true}),null);
  assert.equal(shortcutPair({alt:true,g:false,h:true}),null);
  for(let i=0;i<100;i++) {
    assert.equal(shortcutPair({alt:true,g:true},()=>i/100).filter(c=>c==='green').length,1);
    assert.deepEqual(shortcutPair({alt:true,g:true,h:true},()=>i/100),['green','green']);
  }
});
test('rare finale boundaries and green tease never mutate final outcomes',()=>{
  const pair=['red','blue'];
  assert.equal(chooseFinale(pair,()=>.0029),'greenTease');
  assert.equal(chooseFinale(pair,()=>.003),'nested');
  assert.equal(chooseFinale(pair,()=>.023),'none');
  assert.equal(chooseFinale(['green','green'],()=>0),'none');
  assert.deepEqual(teasePair(pair,()=>0),['green','green']);
  assert.deepEqual(pair,['red','blue']);
  assert.ok(teasePair(['green','yellow'],()=>.9).every(c=>c==='green'));
});
test('freeze holds virtual time and resumes without skipping motion',()=>{
  const p={freezeAt:1000,freezeDuration:500};
  for(const [wall,virtual] of [[999,999],[1000,1000],[1250,1000],[1500,1000],[1501,1001]]) assert.equal(freezeTimeline(wall,p),virtual);
});
test('nested mega reaches full size and shell is removed before landing',()=>{
  let tick; const events=[];
  runFinale('nested',{frame(){},openShell(){events.push('open');},nestFrame(p){events.push(p);},closeShell(){events.push('close');},land(){events.push('land');}},{now:()=>0,request:cb=>{tick=cb;}});
  tick(600);assert.ok(!events.includes('land'));
  tick(1200);assert.deepEqual(events.slice(-3),[1,'close','land']);
});
test('green tease defers landing until its last instant',()=>{
  let tick;const events=[];
  runFinale('greenTease',{frame(){},tease(){events.push('tease');},closeShell(){},land(){events.push('land');}},{now:()=>0,request:cb=>{tick=cb;}});
  tick(649);assert.deepEqual(events,['tease']);
  tick(650);assert.deepEqual(events,['tease','land']);
});

