import test from 'node:test';
import assert from 'node:assert/strict';
import { abruptFinishPlan } from '../src/suspense-extras.js';
import { createSuspensePlan } from '../src/modes.js';
import { chooseZany, EFFECTS, effectAngle } from '../src/zany.js';
test('all six effects are reachable and settle upright',()=>{
  const found=new Set();
  for(let i=0;i<6;i++){
    let n=0; const names=chooseZany(true,()=>n++===0?(i+.5)/6:.9);
    found.add(names[0]);assert.equal(names.length,1);
  }
  assert.equal(found.size,6);
  for(const name of found){
    const end=EFFECTS[name].at(-1)[0];
    assert.equal(effectAngle(name,0),0);
    assert.equal(effectAngle(name,end)%360,0);
    assert.ok(end<=1700);
  }
});
test('matching colors exclude swapping and repeated effects can chain three times',()=>{
  for(let i=0;i<100;i++){
    let n=0;
    const names=chooseZany(false,()=>n++===0?i/100:0);
    assert.equal(names.length,3);assert.equal(names[1],names[2]);
    assert.ok(!names.includes('indecisive'));
  }
});


test('chain thresholds allow one, two or three effects with repeats',()=>{
  for(const [draws, count] of [[[0,.45],1],[[0,.44,0,.15],2],[[0,.44,0,.14,0],3]]){
    const names=chooseZany(true,()=>draws.shift());
    assert.equal(names.length,count);assert.ok(names.every(n=>n==='stubborn'));
  }
});
test('rare abrupt finish is upright, during cruise, and never replaces a pause-only finish',()=>{
  const p=createSuspensePlan(()=>.2);
  const early=abruptFinishPlan(p,()=>0);
  assert.equal(early.abruptAngle%360,0);
  assert.ok(early.duration>p.acceleration && early.duration<p.acceleration+p.cruise);
  assert.ok(early.duration<p.duration);
  assert.ok(early.cues.every(t=>t<early.duration));
  assert.equal(abruptFinishPlan(p,()=>.03),p);
  const hold={...p,fake:'pause'};
  assert.equal(abruptFinishPlan(hold,()=>0),hold);
});
