import { animateZany } from './zany.js?v=chains-14';
import { afterPause } from './pauses.js?v=zany-13';
import { animateSuspense, createSuspensePlan } from './modes.js?v=zany-13';
import { animateToss } from './animation.js?v=mid-woosh-7';
export function betweenMovementPause(random = Math.random) {
  return (10 + Math.floor(random() * 91)) * 10;
}
export function waitBetweenMovements(callback, random = Math.random, schedule = setTimeout) {
  return schedule(callback, betweenMovementPause(random));
}
export function reversalAngles(random = Math.random) {
  const angles = [45 + random() * 315, -(45 + random() * 315)];
  while (random() < .25) angles.push((angles.length % 2 ? -1 : 1) * (45 + random() * 315));
  return angles;
}
export function abruptFinishPlan(plan, random = Math.random) {
  if (plan.fake === 'pause' || random() >= .03) return plan;
  const startAngle = plan.velocity * plan.acceleration / 2;
  const firstTurn = Math.floor(startAngle / 360) + 1;
  const lastTurn = Math.floor((startAngle + plan.velocity * plan.cruise) / 360);
  const turn = firstTurn + Math.floor(random() * (lastTurn - firstTurn + 1));
  const abruptAngle = turn * 360;
  const duration = plan.acceleration + (abruptAngle - startAngle) / plan.velocity;
  return { ...plan, abruptAngle, duration, cues: plan.cues.filter(t => t < duration) };
}
export function animateExtendedSuspense(callbacks, { plan = createSuspensePlan(), run = animateSuspense } = {}) {
  plan = abruptFinishPlan(plan);
  let revealed = false;
  const waitForEncore = callback => plan.fake === 'pause' ? callback() : afterPause(callback);
  const vary = plan.abruptAngle === undefined && Math.random() < .65;
  const amplitude = Math.min(.12, Math.max(0, (600 / plan.rpm - 1) / 1.5));
  const startAngle = plan.velocity * plan.acceleration / 2;
  const distance = plan.velocity * plan.cruise;
  run({ ...callbacks, plan, frame(angle) {
    if (plan.abruptAngle !== undefined) angle = Math.min(angle, plan.abruptAngle);
    if (plan.fake === 'pause' && angle >= plan.turns * 360 && !revealed) {
      callbacks.revealFinal();
      revealed = true;
    }
    if (vary && angle > startAngle && angle < startAngle + distance) {
      const phase = (angle - startAngle) / distance;
      angle += amplitude * distance / (2 * Math.PI) * Math.sin(phase * 2 * Math.PI) ** 3;
    }
    callbacks.frame(angle);
  }, land() {
    if (plan.fake === 'pause' || plan.abruptAngle !== undefined) { callbacks.land(); return; }
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
          if (p === 1) {
            if (turns.length) waitBetweenMovements(next);
            else callbacks.land();
          } else requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
      callbacks.frame(0); waitForEncore(next);
    } else if (choice < .50) animateZany(callbacks);
    else callbacks.land();
  } });
}

