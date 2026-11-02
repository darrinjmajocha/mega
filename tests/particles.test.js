import test from 'node:test';
import assert from 'node:assert/strict';
import { celebrate } from '../src/particles.js';
test('celebrations create exactly 0/25/100 nodes and remove all after time elapses', () => {
  const previous = Object.fromEntries(['document', 'innerWidth', 'innerHeight', 'requestAnimationFrame'].map(k => [k, globalThis[k]]));
  let pending;
  globalThis.innerWidth = 390;
  globalThis.innerHeight = 844;
  globalThis.requestAnimationFrame = cb => { pending = cb; };
  const makeNode = () => ({ style: {}, setAttribute() {}, querySelector: () => ({ setAttribute() {} }), append() {}, remove() { this.removed = true; } });
  globalThis.document = { createElement: makeNode, createElementNS: makeNode };
  try {
    for (const count of [0, 25, 100]) {
      const nodes = [];
      pending = null;
      celebrate({ append: node => nodes.push(node) }, count, { now: () => 0 });
      assert.equal(nodes.length, count);
      if (count) {
        if (count === 100) {
          pending(3999);
          assert.ok(nodes.every(node => node.style.visibility === 'hidden'));
          pending(6500);
          assert.ok(nodes.some(node => node.style.visibility === 'visible'));
          for (let time = 6600; time <= 16900; time += 100) pending(time);
          assert.ok(nodes.every(node => !node.removed), 'pool keeps raining until the deadline');
          assert.ok(nodes.some(node => node.style.visibility === 'visible'));
        }
        const tick = pending;
        pending = null;
        tick(count === 100 ? 17000 : 20000);
        assert.ok(nodes.every(node => node.removed));
        assert.equal(pending, null, 'no more animation frames after cleanup');
      } else assert.equal(pending, null);
    }
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
    }
  }
});

