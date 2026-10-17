import type { GameState, ActionEnvelope } from '../../../shared/types.js';
import { viewFor, applyAction } from '../game/GameEngine.js';
import { player } from '../game/State.js';
import { evaluateAttack, evaluateDefense } from './ActionEvaluator.js';
export function waitingActor(s: GameState) {
  return s.phase === 'DEFENSE_SELECTION'
    ? s.current!.target
    : s.phase === 'BUY_CONFIRMATION'
      ? s.purchase!.buyer
      : s.attacker;
}
export function botDecision(
  s: GameState,
  actorId = waitingActor(s),
): { state: GameState; envelope: ActionEnvelope } {
  const p = player(s, actorId),
    v = viewFor(s, p.id);
  const candidates =
    s.phase === 'BUY_CONFIRMATION'
      ? [
          {
            action: {
              kind: 'buy' as const,
              accept: Boolean(
                v.purchase && v.purchase.price <= (p.difficulty === 'hard' ? 20 : 14),
              ),
            },
            score: 1,
          },
        ]
      : s.phase === 'DEFENSE_SELECTION'
        ? evaluateDefense(v, p.difficulty)
        : evaluateAttack(v, p.difficulty);
  for (const candidate of candidates) {
    const envelope: ActionEnvelope = {
      id: `bot-${s.version}-${p.id}`,
      version: s.version,
      action: candidate.action,
    };
    try {
      return { state: applyAction(s, p.id, envelope), envelope };
    } catch {
      /* Invalid candidates use the same validator as human commands. */
    }
  }
  const envelope: ActionEnvelope = {
    id: `fallback-${s.version}-${p.id}`,
    version: s.version,
    action:
      s.phase === 'DEFENSE_SELECTION'
        ? { kind: 'defend', pieces: [] }
        : s.phase === 'BUY_CONFIRMATION'
          ? { kind: 'buy', accept: false }
          : { kind: 'pass' },
  };
  return { state: applyAction(s, p.id, envelope), envelope };
}
export function botStep(s: GameState, actorId = waitingActor(s)): GameState {
  return botDecision(s, actorId).state;
}
