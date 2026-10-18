import { describe, expect, it } from 'vitest';
import { remainingTurnTime } from '../client/src/turn-clock';
describe('server-deadline time bar', () => {
  it('shrinks from the absolute deadline, including a throttled or hidden browser tab', () => {
    const timer = { deadline: 61000, durationMs: 60000 };
    expect(remainingTurnTime(timer, 1000)).toMatchObject({
      seconds: 60,
      percent: 100,
      urgent: false,
    });
    expect(remainingTurnTime(timer, 31000)).toMatchObject({
      seconds: 30,
      percent: 50,
      urgent: false,
    });
    expect(remainingTurnTime(timer, 51000)).toMatchObject({ seconds: 10, urgent: true });
    expect(remainingTurnTime(timer, 99999)).toMatchObject({ seconds: 0, percent: 0 });
  });
  it('uses server-clock offset rather than assuming the phone clock is correct', () => {
    const clientNow = 100000,
      serverNow = 10000,
      offset = serverNow - clientNow;
    expect(
      remainingTurnTime({ deadline: 40000, durationMs: 60000 }, clientNow + offset).seconds,
    ).toBe(30);
  });
  it('starts a fresh phase from its new server deadline', () => {
    expect(remainingTurnTime({ deadline: 61000, durationMs: 60000 }, 60000).seconds).toBe(1);
    expect(remainingTurnTime({ deadline: 120000, durationMs: 60000 }, 60000).percent).toBe(100);
  });
  it.each([0, -1, NaN, Infinity])(
    'handles inactive or invalid durations without NaN styles (%s)',
    (durationMs) => {
      expect(remainingTurnTime({ deadline: 10000, durationMs }, 1000).percent).toBe(0);
    },
  );
});
