import test from 'node:test';
import assert from 'node:assert/strict';
import { reversalAngles } from '../src/suspense-extras.js';
test('reversals alternate and continue only below the 25 percent threshold', () => {
  const values = [.2, .7, .249, .5, .1, .4, .25];
  const turns = reversalAngles(() => values.shift());
  assert.equal(turns.length, 4);
  assert.deepEqual(turns.map(Math.sign), [1,-1,1,-1]);
  assert.ok(turns.every(x => Math.abs(x) >= 45 && Math.abs(x) <= 360));
  assert.equal(reversalAngles(() => .5).length, 2);
});
