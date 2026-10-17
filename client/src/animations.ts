import type { GameEvent } from '../../shared/types';
import { preferences } from './audio';
export function animateEvent(event: GameEvent) {
  if (!preferences.motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const target = document.querySelector<HTMLElement>(
      `[data-player="${event.target ?? event.actor}"]`,
    ),
    source = document.querySelector<HTMLElement>(`[data-player="${event.actor}"]`);
  if (event.type === 'attack' || event.type === 'reflect' || event.type === 'flick') {
    const a =
        source?.getBoundingClientRect() ??
        document.querySelector('.center-sigil')?.getBoundingClientRect(),
      b = target?.getBoundingClientRect();
    if (a && b) {
      const x = a.x + a.width / 2,
        y = a.y + a.height / 2,
        dx = b.x + b.width / 2 - x,
        dy = b.y + b.height / 2 - y;
      const beam = document.createElement('div');
      beam.className = `event-beam ${event.type}`;
      Object.assign(beam.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${Math.hypot(dx, dy)}px`,
        transform: `rotate(${Math.atan2(dy, dx)}rad)`,
      });
      document.body.append(beam);
      beam
        .animate(
          [
            { opacity: 0, scale: '0 1' },
            { opacity: 0.8, scale: '1 1', offset: 0.45 },
            { opacity: 0, scale: '1 1' },
          ],
          { duration: 550 },
        )
        .finished.then(
          () => beam.remove(),
          () => beam.remove(),
        );
    }
  }
  if (['damage', 'heal', 'revive', 'demon', 'dark_death'].includes(event.type) && target) {
    const bounds = target.getBoundingClientRect(),
      text = document.createElement('span');
    text.className = `floating-number ${event.type}`;
    text.textContent =
      event.type === 'heal' || event.type === 'revive'
        ? `+${event.amount ?? ''}`
        : event.type === 'dark_death'
          ? '즉사'
          : `−${event.amount ?? ''}`;
    Object.assign(text.style, {
      left: `${bounds.x + bounds.width / 2}px`,
      top: `${bounds.y + 15}px`,
    });
    document.body.append(text);
    text
      .animate(
        [
          { opacity: 0, transform: 'translate(-50%, 0) scale(.8)' },
          { opacity: 1, transform: 'translate(-50%, -15px) scale(1.1)', offset: 0.25 },
          { opacity: 0, transform: 'translate(-50%, -45px) scale(1)' },
        ],
        { duration: 1000 },
      )
      .finished.then(
        () => text.remove(),
        () => text.remove(),
      );
  }
  if (
    ['status', 'cleanse', 'summon', 'block', 'death', 'revive', 'damage', 'heal'].includes(
      event.type,
    ) &&
    target
  ) {
    const color =
      event.type === 'damage'
        ? '#f4d9c6'
        : event.type === 'summon'
          ? '#e5d7ed'
          : event.type === 'block'
            ? '#d7e8ed'
            : '#e2eed8';
    target.animate(
      [
        { boxShadow: '0 0 0 0 transparent', transform: 'translateY(0)' },
        {
          boxShadow: `0 0 0 5px ${color}`,
          transform: event.type === 'damage' ? 'translateX(3px)' : 'translateY(-3px)',
        },
        { boxShadow: '0 0 0 0 transparent', transform: 'translateY(0)' },
      ],
      { duration: 500 },
    );
  }
  if (event.type === 'draw')
    document
      .querySelector('.hand-area')
      ?.animate([{ opacity: 0.75 }, { opacity: 1 }], { duration: 350 });
  if (event.type === 'game_end')
    document.querySelector('.result')?.animate(
      [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 650 },
    );
}
