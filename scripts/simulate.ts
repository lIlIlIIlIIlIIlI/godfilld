import { createGame } from '../server/src/game/GameEngine';
import { botStep } from '../server/src/ai/BotController';
import { playerCounts } from '../shared/settings';
const count = Number(process.argv[2] ?? 100);
let max = 0,
  total = 0,
  draws = 0;
const start = Date.now();
for (let seed = 1; seed <= count; seed++) {
  let s = createGame(
    `sim-${seed}`,
    Array.from({ length: playerCounts[seed % playerCounts.length] }, (_, i) => ({
      id: `p${i}`,
      name: `봇 ${i}`,
      bot: true,
      difficulty: (['easy', 'normal', 'hard'] as const)[seed % 3],
      team: seed % 4 === 0 ? `T${i % 2}` : 'SINGLE',
    })),
    seed,
  );
  let moves = 0;
  while (s.phase !== 'FINISHED' && moves++ < 5000) {
    s = botStep(s);
    for (const p of s.players) {
      if ([p.hp, p.mp, p.gold].some((n) => n < 0 || n > 99))
        throw new Error(`Invalid stats seed ${seed}`);
      if (p.hand.length + p.abilities.length > 16) throw new Error(`Capacity seed ${seed}`);
    }
  }
  if (s.phase !== 'FINISHED') throw new Error(`Unfinished seed ${seed}`);
  if (!s.winners.length) draws++;
  max = Math.max(max, s.turn);
  total += moves;
  if (seed % 25 === 0)
    console.log(
      JSON.stringify({
        completed: seed,
        maxTurns: max,
        moves: total,
        draws,
        seconds: (Date.now() - start) / 1000,
      }),
    );
}
console.log(
  JSON.stringify({
    completed: count,
    maxTurns: max,
    moves: total,
    draws,
    seconds: (Date.now() - start) / 1000,
  }),
);
