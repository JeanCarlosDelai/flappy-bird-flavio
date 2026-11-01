import { beforeEach, describe, expect, it } from 'vitest';
import { CATALOG, discover, loadCollection, progress, resetCollection } from '../collection';

describe('collection', () => {
  beforeEach(() => resetCollection());

  it('has 24 chaser variants, 4 stops and 16 obstacles', () => {
    expect(progress()).toEqual({
      chasers: { found: 0, total: 24 },
      stops: { found: 0, total: 4 },
      obstacles: { found: 0, total: 16 },
      all: { found: 0, total: 44 }
    });
    expect(CATALOG.find((i) => i.id === 'janja:aberta')?.name).toBe('Janja com a Constituição aberta');
    expect(CATALOG.find((i) => i.id === 'renan:guitarra')?.name).toBe('Renan Santos guitarrista');
  });

  it('returns the item only the first time and counts every sighting', () => {
    expect(discover('chasers', 'renan:guitarra', 1000)?.name).toBe('Renan Santos guitarrista');
    expect(discover('chasers', 'renan:guitarra', 2000)).toBeNull();
    expect(loadCollection().chasers['renan:guitarra']).toEqual({ first: 1000, count: 2 });
    expect(progress().chasers).toEqual({ found: 1, total: 24 });
  });

  it('ignores unknown ids', () => {
    expect(discover('obstacles', 'disco-voador')).toBeNull();
    expect(progress().all.found).toBe(0);
  });
});
