// Linear weights: 0.1s is 1.5 times as likely as 5.0s.
export function randomPause(random = Math.random) {
  let draw = random() * 62.5;
  for (let i = 0; i < 50; i++) {
    draw -= 1.5 - i * .5 / 49;
    if (draw < 0) return (i + 1) * 100;
  }
  return 5000;
}
export function afterPause(callback, random = Math.random, schedule = setTimeout) {
  return schedule(callback, randomPause(random));
}
