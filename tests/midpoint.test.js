import test from 'node:test';
import assert from 'node:assert/strict';
import { animateToss } from '../src/animation.js';
test('normal reveal switches once at 875ms without cycling and before landing', () => {
  let tick; const events=[];
  animateToss({frame(){},cycle(){events.push('cycle');},woosh(){},land(){events.push('land');},
    revealMidpoint(){events.push('reveal');},now:()=>0,request:cb=>{tick=cb;}});
  tick(874); assert.deepEqual(events,[]);
  tick(875); assert.deepEqual(events,['reveal']);
  tick(1200); assert.deepEqual(events,['reveal']);
  tick(1750); assert.deepEqual(events,['reveal','land']);
});
test('skipped frames still reveal the result before landing', () => {
  let tick; const events=[];
  animateToss({frame(){},cycle(){events.push('cycle');},woosh(){},land(){events.push('land');},
    revealMidpoint(){events.push('reveal');},now:()=>0,request:cb=>{tick=cb;}});
  tick(2000); assert.deepEqual(events,['reveal','land']);
});
