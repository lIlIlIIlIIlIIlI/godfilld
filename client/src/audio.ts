let context: AudioContext | undefined;
let musicTimer: number | undefined;
export const preferences = {
  effects: Number(localStorage.getItem('arena-effects') ?? 0.25),
  music: Number(localStorage.getItem('arena-music') ?? 0),
  motion: localStorage.getItem('arena-motion') !== 'off',
};
export function unlockAudio() {
  context ??= new AudioContext();
  void context.resume();
}
function tone(hz: number, duration: number, volume: number) {
  if (!context || context.state !== 'running' || volume <= 0) return;
  const o = context.createOscillator(),
    g = context.createGain();
  o.type = 'sine';
  o.frequency.value = hz;
  g.gain.setValueAtTime(0, context.currentTime);
  g.gain.linearRampToValueAtTime(volume * 0.12, context.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  o.connect(g);
  g.connect(context.destination);
  o.start();
  o.stop(context.currentTime + duration + 0.03);
}
export function sound(type: string) {
  const frequency: Record<string, number> = {
    select: 660,
    attack: 180,
    damage: 100,
    heal: 740,
    reflect: 880,
    block: 280,
    status: 420,
    summon: 520,
    death: 80,
    game_end: 1040,
    draw: 500,
  };
  tone(frequency[type] ?? 330, 0.25, preferences.effects);
}
export function setMusic() {
  window.clearInterval(musicTimer);
  if (preferences.music > 0) {
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63];
    let i = 0;
    musicTimer = window.setInterval(
      () => tone(notes[i++ % notes.length], 1.9, preferences.music * 0.4),
      2400,
    );
  }
}
