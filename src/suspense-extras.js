import { afterPause } from './pauses.js?v=pauses-10';
import { animateSuspense, createSuspensePlan } from './modes.js?v=pauses-10';
import { animateToss } from './animation.js?v=mid-woosh-7';
export function reversalAngles(random = Math.random) {
  const angles = [45 + random() * 315, -(45 + random() * 315)];
  while (random() < .25) angles.push((angles.length % 2 ? -1 : 1) * (45 + random() * 315));
  return angles;
}
export function animateExtendedSuspense(callbacks) {
  const plan = createSuspensePlan();
  const waitForEncore = callback => plan.fake === 'pause' ? callback() : afterPause(callback);
  const vary = Math.random() < .65;
  const amplitude = Math.min(.12, Math.max(0, (300 / plan.rpm - 1) / 1.5));
  const startAngle = plan.velocity * plan.acceleration / 2;
  const distance = plan.velocity * plan.cruise;
  animateSuspense({ ...callbacks, plan, frame(angle) {
    if (vary && angle > startAngle && angle < startAngle + distance) {
      const phase = (angle - startAngle) / distance;
      angle += amplitude * distance / (2 * Math.PI) * Math.sin(phase * 2 * Math.PI) ** 3;
    }
    callbacks.frame(angle);
  }, land() {
    const choice = Math.random();
    if (choice < .05) {
      callbacks.frame(0);
      waitForEncore(() => { callbacks.throwAgain(); animateToss(callbacks); });
    } else if (choice < .25) {
      const turns = reversalAngles();
      const total = turns.reduce((a,b) => a+b, 0);
      // Finish upright with a short final movement instead of snapping.
      const settle = Math.round(total / 360) * 360 - total;
      if (Math.abs(settle) > .01) turns.push(settle);
      let angle = 0;
      function next() {
        if (!turns.length) { callbacks.land(); return; }
        const delta = turns.shift(), duration = Math.max(100, Math.abs(delta) / 1.5);
        const start = performance.now(), from = angle;
        callbacks.rotationWoosh(duration / 1000);
        callbacks.cycle();
        function tick(now) {
          const p = Math.min(1, (now - start) / duration);
          angle = from + delta * (3*p*p - 2*p*p*p);
          callbacks.frame(angle);
          if (p === 1) next(); else requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
      callbacks.frame(0); waitForEncore(next);
    } else callbacks.land();
  } });
}

