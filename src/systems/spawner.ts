import { WORLD } from '@/core/config';
import { Balloons, Helicopter, Radar, TogaBarrier, type Obstacle } from '@/entities/obstacles';
import { gapFor, intervalFor } from './difficulty';

type Factory = (x: number, score: number) => Obstacle;

const playTop = 40;
const playBottom = WORLD.height - WORLD.groundHeight - 40;

const randomGapCenter = (gap: number) =>
  playTop + gap / 2 + Math.random() * (playBottom - playTop - gap);

/** Tabela de sorteio: cada tipo entra no jogo a partir de certa pontuação. */
const TABLE: { minScore: number; weight: number; make: Factory }[] = [
  { minScore: 0, weight: 4, make: (x, s) => new TogaBarrier(x, randomGapCenter(gapFor(s)), gapFor(s)) },
  { minScore: 3, weight: 3, make: (x, s) => new Balloons(x, randomGapCenter(gapFor(s) + 20), gapFor(s) + 20) },
  { minScore: 6, weight: 2, make: (x) => new Helicopter(x, playTop + 60 + Math.random() * (playBottom - playTop - 120)) },
  { minScore: 10, weight: 2, make: (x, s) => new Radar(x, gapFor(s)) }
];

export class Spawner {
  private timer = 0.6;

  update(dt: number, score: number, spawn: (o: Obstacle) => void): void {
    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer = intervalFor(score);

    const options = TABLE.filter((t) => score >= t.minScore);
    const total = options.reduce((sum, t) => sum + t.weight, 0);
    let roll = Math.random() * total;
    for (const option of options) {
      roll -= option.weight;
      if (roll <= 0) {
        spawn(option.make(WORLD.width + 20, score));
        return;
      }
    }
  }
}
