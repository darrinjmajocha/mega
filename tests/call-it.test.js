import test from 'node:test';
import assert from 'node:assert/strict';
import { roundPoints, winners } from '../src/call-it.js';

test('Call It scores ordered halves and one bonus for any matching opponent', () => {
  const guess = ['red','yellow'];
  assert.deepEqual(roundPoints([guess,guess,guess],[['red','blue'],guess,guess]), [2,3,3]);
  assert.deepEqual(roundPoints([guess,guess],[['blue','blue'],['yellow','red']]), [0,0]);
});
test('a green pays three or nine on its own side', () => {
  const rolls = [['red','green'],['green','blue']];
  assert.deepEqual(roundPoints([['red','green'],['blue','green']], rolls), [10,3]);
});
test('win by two, or win immediately on double green including simultaneous winners', () => {
  assert.deepEqual(winners([15,14,8],15), []);
  assert.deepEqual(winners([16,14,8],15), [0]);
  assert.deepEqual(winners([14,0],15), []);
  assert.deepEqual(winners([15,2],15,[['red','red'],['green','green']]), [1]);
  assert.deepEqual(winners([2,4],15,[['green','green'],['green','green']]), [0,1]);
});
