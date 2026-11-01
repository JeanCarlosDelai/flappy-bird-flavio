import { rand } from '@/core/random';
import { WORLD } from '@/core/config';
import { Balloons, Helicopter, Radar, TogaBarrier, type Obstacle } from '@/entities/obstacles';
import { gapFor, intervalFor, speedFor } from './difficulty';
import { FerrisWheel, GATES, Gate, Pelicans, Searchlight, makeCuia, makeGator, makeIguana, makeQuati } from '@/entities/obstacles-extra';
import { stageForScore, type RegionId } from '@/render/stages';

type Factory = (x: number, score: number) => Obstacle;

const playTop = 40;
const playBottom = WORLD.height - WORLD.groundHeight - 40;

const randomGapCenter = (gap: number) =>
  playTop + gap / 2 + rand() * (playBottom - playTop - gap);

/**
 * Obstáculos de cada parada. Dentro da fase, cada um entra a partir de certa
 * pontuação (contada desde a chegada à parada).
 */
const TABLES: Record<RegionId, { from: number; weight: number; make: Factory }[]> = {
  brasilia: [
    { from: 0, weight: 4, make: (x, s) => new TogaBarrier(x, randomGapCenter(gapFor(s)), gapFor(s)) },
    { from: 4, weight: 3, make: (x, s) => new Balloons(x, randomGapCenter(gapFor(s) + 20), gapFor(s) + 20) },
    { from: 10, weight: 3, make: (x, s) => new Gate(x, randomGapCenter(gapFor(s)), gapFor(s), GATES.cupulas) },
    { from: 18, weight: 2, make: (x) => new Helicopter(x, playTop + 60 + rand() * (playBottom - playTop - 120)) }
  ],
  iguazu: [
    { from: 0, weight: 3, make: (x, s) => new Gate(x, randomGapCenter(gapFor(s) + 30), gapFor(s) + 30, GATES.cataratas) },
    { from: 4, weight: 3, make: (x, s) => new Gate(x, randomGapCenter(gapFor(s) + 40), gapFor(s) + 40, GATES.cancela) },
    { from: 10, weight: 2, make: (x) => makeQuati(x) },
    { from: 18, weight: 2, make: (x) => makeCuia(x) }
  ],
  guayaquil: [
    { from: 0, weight: 3, make: (x, s) => new Gate(x, randomGapCenter(gapFor(s)), gapFor(s), GATES.bananas) },
    { from: 4, weight: 2, make: (x) => makeIguana(x) },
    { from: 10, weight: 2, make: (x) => new FerrisWheel(x) },
    { from: 18, weight: 2, make: (x, s) => new Radar(x, gapFor(s)) }
  ],
  miami: [
    { from: 0, weight: 3, make: (x, s) => new Gate(x, randomGapCenter(gapFor(s) + 20), gapFor(s) + 20, GATES.predios) },
    { from: 4, weight: 2, make: (x) => new Pelicans(x, playTop + 80 + rand() * (playBottom - playTop - 220)) },
    { from: 10, weight: 2, make: (x) => makeGator(x) },
    { from: 18, weight: 2, make: (x) => new Searchlight(x) }
  ]
};

export class Spawner {
  private timer = 0.6;

  /** Tempo até o próximo obstáculo (para pôr moedas no meio do caminho). */
  get timeToNext(): number {
    return this.timer;
  }

  /** Pausa um tempo (ex.: durante a viagem entre paradas). */
  hold(seconds: number): void {
    this.timer = Math.max(this.timer, seconds);
  }

  update(dt: number, score: number, spawn: (o: Obstacle) => void): void {
    this.timer -= dt;
    if (this.timer > 0) return;

    const stage = stageForScore(score);
    const inStage = score - stage.fromScore;
    const options = TABLES[stage.id].filter((t) => inStage >= t.from);
    const total = options.reduce((sum, t) => sum + t.weight, 0);
    let roll = rand() * total;
    for (const option of options) {
      roll -= option.weight;
      if (roll <= 0) {
        const obstacle = option.make(WORLD.width + 20, score);
        spawn(obstacle);
        // obstáculos largos (roda-gigante, pelicanos) pedem mais espaço até o próximo
        this.timer = intervalFor(score) + Math.max(0, obstacle.width - 64) / speedFor(score);
        return;
      }
    }
  }
}
