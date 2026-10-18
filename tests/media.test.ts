import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { cards } from '../shared/catalog';
import { eventClips, battleClip } from '../shared/sounds';
import { createGame, viewFor } from '../server/src/game/GameEngine';
import art from '../data/asset-manifest.json';
import sounds from '../data/sound-assets.json';
import referenceUI from '../data/ui-asset-manifest.json';
const bytes = (url: string) => readFileSync(new URL('../client/public' + url, import.meta.url));
const hash = (data: Uint8Array) => createHash('sha256').update(data).digest('hex');
describe('original media registry', () => {
  it('maps every drawable card and keeps unavailable historical cards explicit', () => {
    expect(Object.keys(art.approvedOriginalAssets)).toHaveLength(246);
    for (const c of cards.filter((c) => c.weight > 0)) {
      expect(c.image).toMatch(/^\/assets\/original\/\d{3}\.webp$/);
      expect(c.imageSprite).toBeDefined();
      const s = c.imageSprite!;
      expect(s.x + s.width).toBeLessThanOrEqual(s.atlasWidth);
      expect(s.y + s.height).toBeLessThanOrEqual(s.atlasHeight);
    }
    expect(art.unavailableOriginalCards).toHaveLength(118);
    for (const entry of art.unavailableOriginalCards) {
      expect(cards[entry.cardId].weight).toBe(0);
      expect(cards[entry.cardId].imageSprite).toBeUndefined();
    }
    expect(
      (art.approvedOriginalAssets as Record<string, { source: string }>)['5'].source,
    ).toContain('weapon/paper_knife.png');
    expect(
      (art.approvedOriginalAssets as Record<string, { source: string }>)['207'].source,
    ).toContain('magic/yami.png');
    expect(art.mappingEvidence.embeddedRulesMatchServerCSV).toBe(true);
  });
  it('ships all 317 lossless images and 46 original MP3 files recorded by the importer', () => {
    expect(Object.keys(art.imageFiles)).toHaveLength(317);
    for (const image of Object.values(art.imageFiles)) {
      expect(hash(bytes(image.url))).toBe(image.sha256);
      expect(bytes(image.url).length).toBe(image.bytes);
    }
    expect(Object.keys(sounds.clips)).toHaveLength(46);
    for (const clip of Object.values(sounds.clips)) {
      const data = bytes(clip.url);
      expect(data.length).toBe(clip.bytes);
      expect(hash(data)).toBe(clip.sha256);
    }
    for (const name of Object.values(eventClips)) expect(sounds.clips).toHaveProperty(name);
  });
  it('chooses original clips for turn, MP recovery, disease and each result', () => {
    const state = createGame(
      'media-test',
      [
        { id: 'me', name: '나' },
        { id: 'other', name: '상대' },
      ],
      1,
    );
    const game = viewFor(state, 'me');
    const event = { seq: 1, turn: 1, type: 'turn_start', actor: 'other' };
    expect(battleClip(event, game, 'me')).toBeUndefined();
    expect(battleClip({ ...event, actor: 'me' }, game, 'me')).toBe('client_turn');
    expect(battleClip({ ...event, type: 'attack', cards: [231] }, game, 'me')).toBe('mp_increase');
    expect(battleClip({ ...event, type: 'status', text: 'COLD' }, game, 'me')).toBe('disease');
    game.winners = ['me'];
    expect(battleClip({ ...event, type: 'game_end' }, game, 'me')).toBe('game_win');
    game.winners = ['other'];
    expect(battleClip({ ...event, type: 'game_end' }, game, 'me')).toBe('dead');
    game.winners = [];
    expect(battleClip({ ...event, type: 'game_end' }, game, 'me')).toBe('game_draw');
  });
});

describe('supplied reference-screen assets', () => {
  it('ships the original backgrounds, logo and store badges without modifying their bytes', () => {
    expect(referenceUI.assets).toHaveLength(6);
    for (const asset of referenceUI.assets) {
      expect(asset.source).toMatch(/^https:\/\/godfield.net\/images\//);
      const data = bytes(asset.url);
      expect(data.length).toBe(asset.bytes);
      expect(hash(data)).toBe(asset.sha256);
    }
  });
});
