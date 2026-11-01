import { beforeEach, describe, expect, it } from 'vitest';
import { rand, setSeed, todaySeed } from '@/core/random';
import { addCoins, buySkin, equipSkin, loadProgress, recordDaily, resetProgress } from '../progress';

describe('Desafio do dia (semente)', () => {
  it('repeats the same sequence for the same seed', () => {
    setSeed(20261101);
    const a = [rand(), rand(), rand()];
    setSeed(20261101);
    const b = [rand(), rand(), rand()];
    setSeed(null);
    expect(a).toEqual(b);
    expect(a.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  it('builds the seed from the date in Brasília time', () => {
    expect(todaySeed(new Date('2026-11-01T02:00:00Z'))).toBe(20261031); // 23h em Brasília
    expect(todaySeed(new Date('2026-11-01T15:00:00Z'))).toBe(20261101);
  });
});

describe('moedas e skins', () => {
  beforeEach(() => resetProgress());

  it('starts with only the classic jet', () => {
    expect(loadProgress()).toMatchObject({ coins: 0, skins: ['classico'], skin: 'classico' });
  });

  it('buys a skin only with enough coins and equips it', () => {
    expect(buySkin('dourado', 80)).toBe(false);
    addCoins(100);
    expect(buySkin('dourado', 80)).toBe(true);
    expect(loadProgress()).toMatchObject({ coins: 20, totalCoins: 100, skin: 'dourado' });
    expect(loadProgress().skins).toContain('dourado');
    equipSkin('classico');
    expect(loadProgress().skin).toBe('classico');
    equipSkin('disco-voador'); // não comprado: ignora
    expect(loadProgress().skin).toBe('classico');
  });

  it('keeps the best score of the daily challenge', () => {
    expect(recordDaily(20261101, 12)).toBe(12);
    expect(recordDaily(20261101, 8)).toBe(12);
    expect(recordDaily(20261101, 30)).toBe(30);
  });
});

describe('event medals', () => {
  it('unlocks a medal for an event survived without hits and for the coin rain', async () => {
    const { MEDALS } = await import('../medals');
    const run = { score: 5, durationMs: 1, hits: 1, radarAlerts: 0, cause: 'chao', hitsByObstacle: {}, eventsClean: ['apagao'], rainCoins: 10 } as const;
    const history = { runs: 1, deaths: {} } as never;
    const ok = (id: string) => MEDALS.find((m) => m.id === id)!.check({ ...run, eventsClean: [...run.eventsClean] }, history);
    expect(ok('evento-apagao')).toBe(true);
    expect(ok('evento-fraldas')).toBe(false);
    expect(ok('evento-moedas')).toBe(true);
  });
});
