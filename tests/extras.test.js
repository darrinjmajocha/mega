import test from 'node:test';
import assert from 'node:assert/strict';
import { reversalAngles, betweenMovementPause, waitBetweenMovements } from '../src/suspense-extras.js';
test('reversals alternate and continue only below the 50 percent threshold', () => {
  const values = [.2, .7, .499, .5, .1, .4, .50];
  const turns = reversalAngles(() => values.shift());
  assert.equal(turns.length, 4);
  assert.deepEqual(turns.map(Math.sign), [1,-1,1,-1]);
  assert.ok(turns.every(x => Math.abs(x) >= 45 && Math.abs(x) <= 360));
  assert.equal(reversalAngles(() => .5).length, 2);
});

test('between-movement pauses cover all 91 hundredths from 0.10 to 1.00 seconds', () => {
  const values = Array.from({length:91}, (_,i) => betweenMovementPause(() => (i+.5)/91));
  assert.deepEqual(values, Array.from({length:91},(_,i)=>(i+10)*10));
  assert.equal(betweenMovementPause(()=>0),100);
  assert.equal(betweenMovementPause(()=>.999999),1000);
});
test('next movement starts only after the independently sampled delay', () => {
  let pending, delay, started=false;
  waitBetweenMovements(()=>{started=true;},()=>0,(fn,ms)=>{pending=fn;delay=ms;});
  assert.equal(started,false); assert.equal(delay,100);
  pending(); assert.equal(started,true);
});
