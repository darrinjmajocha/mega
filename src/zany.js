// Times are milliseconds; angles are cumulative degrees. Each ends upright.
export const EFFECTS = {
  stubborn: [[0,0],[180,90],[400,90],[580,45],[730,45],[950,0]],
  windup: [[0,0],[500,-100],[650,-100],[1050,360]],
  ticking: [[0,0],[150,45],[230,45],[380,90],[460,90],[610,180],[690,180],[840,270],[920,270],[1120,360]],
  falseFinish: [[0,0],[320,390],[550,335],[740,370],[950,360]],
  sleepy: [[0,0],[700,55],[900,235],[1700,360]],
  indecisive: [[0,0],[900,0]]
};
export function chooseZany(canSwap, random = Math.random) {
  const names = Object.keys(EFFECTS).filter(name => canSwap || name !== 'indecisive');
  const first = names[Math.floor(random() * names.length)];
  const result = [first];
  if (random() < .45) {
    result.push(names[Math.floor(random() * names.length)]);
    if (random() < .15) result.push(names[Math.floor(random() * names.length)]);
  }
  return result;
}
export function effectAngle(name, elapsed) {
  const frames = EFFECTS[name];
  for (let i = 1; i < frames.length; i++) {
    const [end, to] = frames[i], [start, from] = frames[i-1];
    if (elapsed <= end) {
      const t = Math.max(0, (elapsed-start)/(end-start));
      return from + (to-from) * t*t*(3-2*t);
    }
  }
  return frames.at(-1)[1];
}
export function animateZany(callbacks, names = chooseZany(callbacks.canSwap)) {
  let index = 0;
  function next() {
    if (index === names.length) { callbacks.land(); return; }
    const name = names[index++], duration = EFFECTS[name].at(-1)[0];
    const start = performance.now();
    let swap = -1;
    callbacks.frame(0);
    if (name !== 'indecisive') callbacks.woosh();
    function tick(now) {
      const elapsed = now-start;
      callbacks.frame(effectAngle(name, elapsed));
      if (name === 'indecisive') {
        const step = Math.floor(Math.min(elapsed, duration)/180);
        if (step !== swap) { callbacks.swapPreview(step % 2 === 0); swap = step; }
      }
      if (elapsed >= duration) next(); else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  next();
}

