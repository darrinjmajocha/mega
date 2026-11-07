const samePair = (a, b) => a[0] === b[0] && a[1] === b[1];

export function earlierClaims(guesses, claims, player) {
  return guesses.map((_, i) => i).filter(i => claims[i] < claims[player] && samePair(guesses[i], guesses[player]));
}

export function sidePoints(guess, color) {
  if (color === 'green') return guess === color ? 9 : 3;
  return Number(guess === color);
}

export function roundPoints(guesses, rolls, claims = []) {
  return guesses.map((guess, player) => {
    const roll = rolls[player];
    let points = roll.reduce((sum, color, side) => sum + sidePoints(guess[side], color), 0);
    const copiedHit = !samePair(roll, guess) && earlierClaims(guesses, claims, player).some(i => samePair(rolls[i], guess));
    if (copiedHit) points--;
    else if (rolls.some((other, i) => i !== player && samePair(other, guess))) points++;
    return points;
  });
}

export function winners(scores, limit, rolls = []) {
  const doubles = scores.map((_, i) => i).filter(i => rolls[i]?.every(color => color === 'green'));
  if (doubles.length) return doubles;
  const [first, second] = [...scores].sort((a, b) => b - a);
  return first >= limit && first - second >= 2 ? [scores.indexOf(first)] : [];
}
