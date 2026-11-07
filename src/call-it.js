export function roundPoints(guesses, rolls) {
  return guesses.map((guess, player) => {
    const roll = rolls[player];
    let points = roll.reduce((sum, color, side) => {
      if (color === 'green') return sum + (color === guess[side] ? 9 : 3);
      return sum + Number(color === guess[side]);
    }, 0);
    if (rolls.some((other, index) => index !== player && other.every((color, side) => color === guess[side]))) points++;
    return points;
  });
}

export function winners(scores, limit, rolls = []) {
  const doubles = scores.map((_, i) => i).filter(i => rolls[i]?.every(color => color === 'green'));
  if (doubles.length) return doubles;
  const [first, second] = [...scores].sort((a, b) => b - a);
  return first >= limit && first - second >= 2 ? [scores.indexOf(first)] : [];
}
