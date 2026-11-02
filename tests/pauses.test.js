import test from 'node:test';
import assert from 'node:assert/strict';
import { randomPause, afterPause } from '../src/pauses.js';
test('all fifty tenths are reachable with a gentle lower bias', () => {
  const counts = new Map();
  for(let i=0;i<100000;i++){const p=randomPause(()=>i/100000);assert.equal(p%100,0);counts.set(p,(counts.get(p)||0)+1);}
  assert.equal(counts.size,50);
  assert.equal(randomPause(()=>0),100);
  assert.equal(randomPause(()=>.999999),5000);
  const ratio=counts.get(100)/counts.get(5000);
  assert.ok(ratio>1.79 && ratio<1.81);
});
test('actions wait for the sampled pause before starting',()=>{
  let pending, delay, called=false;
  afterPause(()=>{called=true;},()=>.999999,(fn,ms)=>{pending=fn;delay=ms;});
  assert.equal(called,false);assert.equal(delay,5000);
  pending();assert.equal(called,true);
});
