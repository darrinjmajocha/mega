import test from 'node:test';
import assert from 'node:assert/strict';
import { animateExtendedSuspense } from '../src/suspense-extras.js';
import { createSuspensePlan } from '../src/modes.js';
test('pause-only ending reveals once at stop and lands without another fake-out', () => {
  let i=0; const plan=createSuspensePlan(()=>i++===4?.5:.4);
  assert.equal(plan.fake,'pause');
  const events=[];
  animateExtendedSuspense({
    frame(){}, cycle(){events.push('cycle');}, revealFinal(){events.push('reveal');},
    land(){events.push('land');}, throwAgain(){assert.fail('No encore');},
    rotationWoosh(){assert.fail('No reversal');}
  }, {plan, run(callbacks){
    callbacks.frame(plan.turns*360-1);
    assert.deepEqual(events,[]);
    callbacks.frame(plan.turns*360);
    callbacks.frame(plan.turns*360);
    assert.deepEqual(events,['reveal']);
    callbacks.land();
  }});
  assert.deepEqual(events,['reveal','land']);
});
