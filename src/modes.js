import { randomPause } from './pauses.js?v=zany-13';
// These animations are separate from the unchanged normal-mode timeline.
const clamp = value => Math.max(0, Math.min(1, value));
export const REDUCED_DURATION = 2000;
export function reducedOpacityAt(ms) {
  if (ms < 500) return 1 - clamp(ms / 500);
  if (ms < 1500) return 0;
  return clamp((ms - 1500) / 500);
}
export function animateReduced({ fade, reveal, land, now = performance.now.bind(performance), request = requestAnimationFrame }) {
  const start = now();
  let revealed = false;
  function tick(timestamp) {
    const elapsed = timestamp - start;
    if (!revealed && elapsed >= 500) { reveal(); revealed = true; }
    fade(reducedOpacityAt(elapsed));
    if (elapsed >= REDUCED_DURATION) { land(); return; }
    request(tick);
  }
  tick(start);
}
export function createSuspensePlan(random = Math.random) {
  const rpm = 60 + random() * 540;
  const velocity = rpm * 360 / 60000; // degrees per millisecond
  const acceleration = 350 + random() * 450;
  const deceleration = 2400 + random() * 2400;
  const rampTurns = velocity * (acceleration + deceleration) / 720;
  const turns = Math.ceil(rampTurns) + 2 + Math.floor(random() * 4);
  const cruise = (turns * 360 - velocity * (acceleration + deceleration) / 2) / velocity;
  const stop = acceleration + cruise + deceleration;
  const choice = random();
  const fake = choice < .45 ? 'none' : choice < .6 ? 'pause' : choice < .8 ? 'colors' : 'spin';
  const pause = fake === 'none' ? 0 : randomPause(random);
  const encore = (fake === 'none' || fake === 'pause') ? 0 : fake === 'spin' ? 300 : 500;
  const plan = { rpm, velocity, acceleration, deceleration, cruise, turns, stop, fake, pause, encore, duration: stop + pause + encore };
  // Cues belong to actual half-turn crossings, even with variable speed.
  plan.cues = Array.from({ length: turns }, (_, i) => {
    const target = (i + .5) * 360;
    let lo = 0, hi = stop;
    for (let j = 0; j < 40; j++) {
      const mid = (lo + hi) / 2;
      if (suspenseAngleAt(plan, mid) < target) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  });
  if (fake === 'spin') plan.cues.push(stop + pause + encore / 2);
  return plan;
}
export function suspenseAngleAt(p, ms) {
  const t = Math.max(0, ms), a = p.acceleration, c = p.cruise, v = p.velocity;
  if (t < a) return v * t * t / (2 * a);
  if (t < a + c) return v * a / 2 + v * (t - a);
  if (t < p.stop) {
    const s = t - a - c;
    return v * a / 2 + v * c + v * (s - s * s / (2 * p.deceleration));
  }
  const extra = p.fake === 'spin' ? clamp((t - p.stop - p.pause) / p.encore) : 0;
  // Smooth full-turn encore starts and ends at rest.
  return p.turns * 360 + 360 * (3 * extra ** 2 - 2 * extra ** 3);
}
export function animateSuspense({ frame, cycle, woosh, land, plan = createSuspensePlan(), now = performance.now.bind(performance), request = requestAnimationFrame }) {
  const start = now();
  let cue = 0, lastCycle = '';
  function tick(timestamp) {
    const elapsed = Math.max(0, timestamp - start);
    while (cue < plan.cues.length && elapsed >= plan.cues[cue]) { woosh(); cue++; }
    frame(suspenseAngleAt(plan, elapsed));
    if (elapsed >= plan.duration) { land(); return; }
    const inEncore = elapsed >= plan.stop + plan.pause;
    if (elapsed < plan.stop || inEncore) {
      const key = `${inEncore ? 'encore' : 'spin'}-${Math.floor(elapsed / 125)}`;
      if (key !== lastCycle) { cycle(); lastCycle = key; }
    }
    request(tick);
  }
  tick(start);
}
