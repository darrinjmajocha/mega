export function shortcutPair(keys, random = Math.random) {
  if (!keys.alt || !keys.g) return null;
  if (keys.h) return ['green', 'green'];
  const other = ['red', 'blue', 'yellow'][Math.floor(random() * 3)];
  return random() < .5 ? ['green', other] : [other, 'green'];
}
export function chooseFinale(pair, random = Math.random) {
  const roll = random();
  if (roll < .003 && pair.some(c => c !== 'green')) return 'greenTease';
  if (roll >= .003 && roll < .023) return 'nested';
  if (roll >= .023 && roll < .043) return 'flight';
  return 'none';
}
export function teasePair(pair, random = Math.random) {
  const preview = [...pair];
  const eligible = pair.map((c,i) => c !== 'green' ? i : -1).filter(i => i >= 0);
  if (!eligible.length) return preview;
  if (random() < .5) return ['green', 'green'];
  preview[eligible[Math.floor(random() * eligible.length)]] = 'green';
  return preview;
}
export function runFinale(kind, callbacks, { now = performance.now.bind(performance), request = requestAnimationFrame } = {}) {
  if (kind === 'none') { callbacks.land(); return; }
  if (kind === 'flight') {
    callbacks.fly((10 + Math.floor(Math.random() * 21)) * 100).then(callbacks.land);
    return;
  }
  const start = now();
  callbacks.frame(0);
  if (kind === 'greenTease') callbacks.tease();
  else callbacks.openShell();
  const duration = kind === 'greenTease' ? 650 : 1200;
  function tick(timestamp) {
    const p = Math.min(1, Math.max(0, (timestamp-start)/duration));
    if (kind === 'nested') callbacks.nestFrame(p);
    if (p === 1) { callbacks.closeShell(); callbacks.land(); return; }
    request(tick);
  }
  tick(start);
}
export function freezeTimeline(elapsed, plan) {
  if (plan.freezeAt === undefined || elapsed <= plan.freezeAt) return elapsed;
  return elapsed - Math.min(elapsed-plan.freezeAt, plan.freezeDuration);
}
