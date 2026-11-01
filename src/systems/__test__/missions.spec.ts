import { beforeEach, describe, expect, it } from 'vitest';
import { applyRunToMissions, dailyMissions, missionStatus, resetMissions } from '../missions';
import { resetProgress, loadProgress } from '../progress';
import type { RunStats } from '../session';

const run = (extra: Partial<RunStats> = {}): RunStats => ({
  score: 10, durationMs: 1000, hits: 0, radarAlerts: 0, cause: 'chao', hitsByObstacle: {}, ...extra
});

describe('missões diárias', () => {
  beforeEach(() => {
    resetMissions();
    resetProgress();
  });

  it('sorteia 3 missões diferentes, iguais para a mesma data', () => {
    const a = dailyMissions(20261101).map((m) => m.id);
    expect(new Set(a).size).toBe(3);
    expect(dailyMissions(20261101).map((m) => m.id)).toEqual(a);
  });

  it('soma as partidas do dia e paga uma vez ao concluir', () => {
    // acha um dia em que "Jogue 5 partidas" está sorteada
    let seed = 20260101;
    while (!dailyMissions(seed).some((m) => m.id === 'partidas')) seed++;
    for (let i = 0; i < 4; i++) expect(applyRunToMissions(run(), seed).some((m) => m.id === 'partidas')).toBe(false);
    const coins = loadProgress().coins;
    expect(applyRunToMissions(run(), seed).map((m) => m.id)).toContain('partidas');
    expect(loadProgress().coins).toBeGreaterThan(coins);
    expect(applyRunToMissions(run(), seed).some((m) => m.id === 'partidas')).toBe(false);
    expect(missionStatus(seed).find((s) => s.mission.id === 'partidas')).toMatchObject({ value: 5, done: true });
  });
});
