export interface TurnDeadline {
  deadline: number;
  durationMs: number;
}
export function remainingTurnTime(timer: TurnDeadline, now: number) {
  const durationMs = Number.isFinite(timer.durationMs) ? Math.max(0, timer.durationMs) : 0;
  const remainingMs =
    durationMs && Number.isFinite(timer.deadline) && Number.isFinite(now)
      ? Math.max(0, Math.min(durationMs, timer.deadline - now))
      : 0;
  return {
    remainingMs,
    seconds: Math.ceil(remainingMs / 1000),
    totalSeconds: Math.ceil(durationMs / 1000),
    percent: durationMs ? (remainingMs / durationMs) * 100 : 0,
    urgent: durationMs > 0 && remainingMs <= durationMs / 3,
  };
}
