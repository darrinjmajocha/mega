export const DURATION = 1750;
export const WOOSH_TIMES = [625, 875, 1125];
// Half-second ramps: 0 -> 240 RPM and 240 -> 0 RPM, one turn each.
// Spins 2-4 each take 250ms (240 RPM).
const accelerate = t => t * t;
export function angleAt(ms) {
  if (ms <= 0) return 0;
  if (ms < 500) return 360 * accelerate(ms / 500);
  if (ms < 1250) return 360 + (ms - 500) * 1.44;
  if (ms < DURATION) return 1440 + 360 * (1 - accelerate(1 - (ms - 1250) / 500));
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
