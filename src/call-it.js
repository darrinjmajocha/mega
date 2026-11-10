const samePair = (a, b) => a[0] === b[0] && a[1] === b[1];

export function earlierClaims(guesses, claims, player) {
  return guesses.map((_, i) => i).filter(i => claims[i] < claims[player] && samePair(guesses[i], guesses[player]));
}

export function sidePoints(guess, color) {
  if (color === 'green') return guess === color ? 9 : 3;
  return Number(guess === color);
}

export function roundBreakdown(guesses, rolls, claims = []) {
  return guesses.map((guess, player) => {
    const roll = rolls[player];
    const sides = roll.map((color, side) => sidePoints(guess[side], color));
    const prior = samePair(roll, guess) ? [] : earlierClaims(guesses, claims, player);
    const matches = [];
    let penalized = false;
    rolls.forEach((other, opponent) => {
      if (opponent === player || !samePair(other, guess)) return;
      if (prior.includes(opponent)) {
        if (!penalized) matches.push({opponent, value:-1});
        penalized = true;
      } else {
        matches.push({opponent, value:1});
      }
    });
    const total = matches.reduce((sum, match) => sum + match.value, sides[0] + sides[1]);
    return {sides, matches, total};
  });
}

export function roundPoints(guesses, rolls, claims = []) {
  return roundBreakdown(guesses, rolls, claims).map(result => result.total);
}

export function winners(scores, limit, rolls = []) {
  const doubles = scores.map((_, i) => i).filter(i => rolls[i]?.every(color => color === 'green'));
  if (doubles.length) return doubles;
  const [first, second] = [...scores].sort((a, b) => b - a);
  return first >= limit && first - second >= 2 ? [scores.indexOf(first)] : [];
}
