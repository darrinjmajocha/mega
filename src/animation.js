export const DURATION = 4000;
export const WOOSH_TIMES = [1500, 2500, 3500];
export function angleAt(ms) {
  if (ms <= 0) return 0;
  if (ms < 500) return 360 * (ms / 500) ** 2;
  if (ms < 3500) return 360 + (ms - 500) * .36;
  if (ms < 4000) return 1440 + 360 * (1 - (1 - (ms - 3500) / 500) ** 2);
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
