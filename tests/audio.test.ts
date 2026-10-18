// @vitest-environment happy-dom
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
let contexts: FakeContext[];
class FakeContext {
  state = 'running';
  currentTime = 0;
  destination = {};
  sources: any[] = [];
  gains: any[] = [];
  resume = vi.fn(async () => {});
  decodeAudioData = vi.fn(async () => ({ duration: 1 }));
  oscillator = vi.fn(() => ({
    type: '',
    frequency: { value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  createOscillator = () => this.oscillator();
  constructor() {
    contexts.push(this);
  }
  createGain() {
    const gain = {
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    this.gains.push(gain);
    return gain;
  }
  createBufferSource() {
    const source = {
      buffer: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    };
    this.sources.push(source);
    return source;
  }
}
beforeEach(() => {
  vi.resetModules();
  contexts = [];
  localStorage.clear();
  vi.stubGlobal('AudioContext', FakeContext);
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});
it('waits for a user gesture, caches decoded MP3 and plays it at the selected volume', async () => {
  const audio = await import('../client/src/audio');
  audio.sound('select');
  expect(fetch).not.toHaveBeenCalled();
  expect(contexts).toHaveLength(0);
  audio.unlockAudio();
  audio.preferences.effects = 0.4;
  audio.sound('select');
  await vi.waitFor(() => expect(contexts[0].sources).toHaveLength(1));
  expect(fetch).toHaveBeenCalledWith('/sounds/original/card.mp3', { cache: 'force-cache' });
  expect(contexts[0].sources[0].start).toHaveBeenCalledOnce();
  expect(contexts[0].gains[0].gain.value).toBe(0.4);
  audio.sound('select');
  await vi.waitFor(() => expect(contexts[0].sources).toHaveLength(2));
  expect(
    vi.mocked(fetch).mock.calls.filter((c) => c[0] === '/sounds/original/card.mp3'),
  ).toHaveLength(1);
  audio.preferences.effects = 0;
  audio.setMusic();
  audio.sound('select');
  expect(contexts[0].gains[0].gain.value).toBe(0);
  expect(contexts[0].sources).toHaveLength(2);
});
it('bounds overlapping voices and falls back if a clip cannot be loaded', async () => {
  const audio = await import('../client/src/audio');
  audio.unlockAudio();
  for (let i = 0; i < 10; i++) audio.sound('damage');
  await vi.waitFor(() => expect(contexts[0].sources).toHaveLength(10));
  expect(contexts[0].sources.filter((s) => s.stop.mock.calls.length)).toHaveLength(4);
  vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
  audio.sound('mystery');
  await vi.waitFor(() => expect(contexts[0].oscillator).toHaveBeenCalled());
});
it('does not break controls in a browser without Web Audio', async () => {
  vi.stubGlobal('AudioContext', undefined);
  const audio = await import('../client/src/audio');
  expect(() => audio.unlockAudio()).not.toThrow();
  expect(() => audio.sound('select')).not.toThrow();
  expect(fetch).not.toHaveBeenCalled();
});
