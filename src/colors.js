export const COLORS = Object.freeze({ red: '#ee4145', blue: '#3478ed', yellow: '#f9d342', green: '#36c46b' });
export function colorFromRoll(roll) {
  if (!Number.isInteger(roll) || roll < 0 || roll > 99) throw new RangeError('Expected an integer from 0 through 99');
  return roll < 33 ? 'red' : roll < 66 ? 'blue' : roll < 99 ? 'yellow' : 'green';
}
export function randomColor(random = Math.random) { return colorFromRoll(Math.floor(random() * 100)); }
export function randomPair(random = Math.random) { return [randomColor(random), randomColor(random)]; }
export function darken(hex) {
  return '#' + hex.slice(1).match(/../g).map(channel => Math.round(parseInt(channel, 16) * .90).toString(16).padStart(2, '0')).join('');
}
export function landingEffect(pair) {
  const greens = pair.filter(color => color === 'green').length;
  return { sound: ['hit', 'hit_g', 'hit_gg'][greens], count: [0, 10, 100][greens] };
}

// Visual cycling uses the same independent 33/33/33/1 distribution.
export function spinningPair(random = Math.random) {
  return randomPair(random);
}
