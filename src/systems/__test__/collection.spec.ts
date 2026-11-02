import { beforeEach, describe, expect, it } from 'vitest';
import { CATALOG, discover, loadCollection, progress, resetCollection } from '../collection';

describe('collection', () => {
  beforeEach(() => resetCollection());

  it('has 43 chaser variants, 4 stops, 34 obstacles, 8 events, 3 vehicles, 4 bosses and 4 weathers', () => {
    expect(progress()).toEqual({
      chasers: { found: 0, total: 43 },
      stops: { found: 0, total: 4 },
      obstacles: { found: 0, total: 34 },
      events: { found: 0, total: 8 },
      vehicles: { found: 0, total: 3 },
      bosses: { found: 0, total: 4 },
      weather: { found: 0, total: 4 },
      all: { found: 0, total: 100 }
    });
    expect(CATALOG.find((i) => i.id === 'janja:aberta')?.name).toBe('Janja com a Constituição aberta');
    expect(CATALOG.find((i) => i.id === 'renan:guitarra')?.name).toBe('Renan Santos guitarrista');
    expect(CATALOG.find((i) => i.id === 'kim:rato')?.name).toBe('Kim Kataguiri versão rato (o meme)');
  });

  it('returns the item only the first time and counts every sighting', () => {
    expect(discover('chasers', 'renan:guitarra', 1000)?.name).toBe('Renan Santos guitarrista');
    expect(discover('chasers', 'renan:guitarra', 2000)).toBeNull();
    expect(loadCollection().chasers['renan:guitarra']).toEqual({ first: 1000, count: 2 });
    expect(progress().chasers).toEqual({ found: 1, total: 43 });
  });

  it('ignores unknown ids', () => {
    expect(discover('obstacles', 'disco-voador')).toBeNull();
    expect(progress().all.found).toBe(0);
  });
});
