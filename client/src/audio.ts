import assets from '../../data/sound-assets.json';
import { eventClips } from '../../shared/sounds';
let context: AudioContext | undefined;
let musicTimer: number | undefined;
const buffers = new Map<string, Promise<AudioBuffer | null>>();
const voices = new Map<AudioBufferSourceNode, GainNode>();
const clips = assets.clips as Record<string, { url: string }>;
const volume = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0);
export const preferences = {
  effects: volume(Number(localStorage.getItem('arena-effects') ?? 0.25)),
  music: volume(Number(localStorage.getItem('arena-music') ?? 0)),
  motion: localStorage.getItem('arena-motion') !== 'off',
};
async function buffer(name: string) {
  if (!context || !clips[name]) return null;
  if (!buffers.has(name)) {
    const audioContext = context;
    buffers.set(
      name,
      fetch(clips[name].url, { cache: 'force-cache' })
        .then((response) => {
          if (!response.ok) throw new Error('Sound unavailable');
          return response.arrayBuffer();
        })
        .then((bytes) => audioContext.decodeAudioData(bytes))
        .catch(() => null),
    );
  }
  return buffers.get(name)!;
}
export function unlockAudio() {
  try {
    const Constructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Constructor) return;
    if (!context) {
      context = new Constructor();
      if (preferences.effects > 0)
        for (const name of ['card', 'button_down', 'damage', 'block']) void buffer(name);
    }
    if (context.state !== 'running') void context.resume().catch(() => {});
  } catch {
    /* Unavailable audio must never interrupt a game action. */
  }
}
function tone(hz: number, duration: number, value: number) {
  if (!context || context.state !== 'running' || value <= 0) return;
  const oscillator = context.createOscillator(),
    gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = hz;
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(volume(value) * 0.12, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + 0.03);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
}
export function sound(type: string) {
  const name = clips[type] ? type : eventClips[type];
  if (!name || !context || context.state !== 'running' || preferences.effects <= 0) return;
  void buffer(name)
    .then((decoded) => {
      if (!context || context.state !== 'running' || preferences.effects <= 0) return;
      if (!decoded) {
        tone(330, 0.15, preferences.effects);
        return;
      }
      while (voices.size >= 6) {
        const oldest = voices.keys().next().value!;
        voices.delete(oldest);
        try {
          oldest.stop();
        } catch {
          /* Already ended. */
        }
      }
      const source = context.createBufferSource(),
        gain = context.createGain();
      source.buffer = decoded;
      gain.gain.value = volume(preferences.effects);
      source.connect(gain);
      gain.connect(context.destination);
      voices.set(source, gain);
      source.onended = () => {
        voices.delete(source);
        source.disconnect();
        gain.disconnect();
      };
      source.start();
    })
    .catch(() => {});
}
export function setMusic() {
  window.clearInterval(musicTimer);
  for (const gain of voices.values()) gain.gain.value = volume(preferences.effects);
  if (preferences.music > 0) {
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63];
    let index = 0;
    musicTimer = window.setInterval(
      () => tone(notes[index++ % notes.length], 1.9, preferences.music * 0.4),
      2400,
    );
  }
}
