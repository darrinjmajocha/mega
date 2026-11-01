import test from 'node:test';
import assert from 'node:assert/strict';
import { colorFromRoll, randomPair, landingEffect, darken, COLORS } from '../src/colors.js';
import { angleAt, animateToss } from '../src/animation.js';
test('exactly 33/33/33/1 outcomes across all integer rolls', () => {
  const counts = { red: 0, blue: 0, yellow: 0, green: 0 };
  for (let i = 0; i < 100; i++) counts[colorFromRoll(i)]++;
  assert.deepEqual(counts, { red: 33, blue: 33, yellow: 33, green: 1 });
  for (const bad of [-1, 100, .5, NaN]) assert.throws(() => colorFromRoll(bad));
});
test('two independent draws include same-color results', () => {
  let calls = 0;
  assert.deepEqual(randomPair(() => [0, .99][calls++]), ['red', 'green']);
  assert.equal(calls, 2);
  assert.deepEqual(randomPair(() => .99), ['green', 'green']);
});
test('all 16 landing pairs select exactly one sound and correct particle count', () => {
  for (const a of Object.keys(COLORS)) for (const b of Object.keys(COLORS)) {
    const green = Number(a === 'green') + Number(b === 'green');
    assert.deepEqual(landingEffect([a, b]), { sound: ['hit', 'hit_g', 'hit_gg'][green], count: [0, 10, 100][green] });
  }
});
test('each bottom RGB channel is rounded to 95% of base', () => {
  for (const hex of Object.values(COLORS)) {
    const result = darken(hex);
    for (const i of [1, 3, 5]) assert.equal(parseInt(result.slice(i, i + 2), 16), Math.round(parseInt(hex.slice(i, i + 2), 16) * .95));
  }
});
test('phase boundaries and constant phase speed are exact', () => {
  for (const [time, angle] of [[0,0],[500,360],[1500,720],[2500,1080],[3500,1440],[4000,1800]]) assert.equal(angleAt(time), angle);
  for (let t = 500; t < 3500; t += 100) assert.ok(Math.abs(angleAt(t + 100) - angleAt(t) - 36) < 1e-9);
});
test('irregular frames cross cues once, finish once, and stop cycling', () => {
  let callback, cycles = 0, lands = 0;
  const cues = [], angles = [];
  animateToss({ now: () => 0, request: cb => { callback = cb; }, frame: a => angles.push(a), cycle: () => cycles++, woosh: i => cues.push(i), land: () => lands++ });
  for (const time of [100, 500, 1499, 1508, 2600, 3501]) callback(time);
  assert.equal(lands, 0);
  const before = cycles;
  callback(4000);
  assert.equal(lands, 1);
  assert.equal(cycles, before);
  assert.deepEqual(cues, [0,1,2]);
  assert.equal(angles.at(-1), 1800);
});
