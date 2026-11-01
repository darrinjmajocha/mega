export const DURATION = 2500;
export const WOOSH_TIMES = [1000, 1500, 2000];
// One turn in 0.5s from rest requires a brief overspeed. This cubic
// joins the 120 RPM middle phase without a velocity discontinuity.
const accelerate = t => 2 * t * t - t * t * t;
export function angleAt(ms) {
  if (ms <= 0) return 0;
  if (ms < 500) return 360 * accelerate(ms / 500);
  if (ms < 2000) return 360 + (ms - 500) * .72;
  if (ms < DURATION) return 1440 + 360 * (1 - accelerate(1 - (ms - 2000) / 500));
  return 1800;
}
export function animateToss({ frame, cycle, woosh, land, now = performance.now.bind(performance), request = requestAnimationFrame }) {
  const start = now();
  let nextWoosh = 0;
  let lastCycle = -1;
  function tick(timestamp) {
    const elapsed = Math.max(0, timestamp - start);
    while (nextWoosh < WOOSH_TIMES.length && elapsed >= WOOSH_TIMES[nextWoosh]) woosh(nextWoosh++);
    frame(angleAt(elapsed));
    if (elapsed >= DURATION) { land(); return; }
    const slot = Math.floor(elapsed / 125);
    if (slot !== lastCycle) { cycle(); lastCycle = slot; }
    request(tick);
  }
  tick(start);
}
