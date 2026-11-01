import { rand } from '@/core/random';
import { WORLD } from '@/core/config';
import { Balloons, Helicopter, Radar, TogaBarrier, type Obstacle } from '@/entities/obstacles';
import { gapFor, intervalFor, speedFor } from './difficulty';
import { FerrisWheel, GATES, Gate, Pelicans, Searchlight, makeCuia, makeGator, makeIguana, makeQuati } from '@/entities/obstacles-extra';
import { stageForScore, type RegionId } from '@/render/stages';
import {
  DroneSwarm,
  Spinner,
  blusinhasPiece,
  faixaPiece,
  livrosPiece,
  lonaPiece,
  outdoorPiece,
  picanhaPiece
} from '@/entities/obstacles-brasilia';
import {
  Rocket,
  TowPlane,
  makeBoat,
  makeBoobies,
  makeFlamingos,
  makeHat,
  makeToucans,
  marcoPiece,
  relogioPiece
} from '@/entities/obstacles-regions';
import type { GateStyle } from '@/entities/obstacles-extra';

const piece = (fn: (top: boolean) => HTMLCanvasElement) => ({ top: () => fn(true), bottom: () => fn(false) });

/** Peças de cima/de baixo dos obstáculos novos. */
const NEW_GATES = {
  blusinhas: { kind: 'blusinhas', width: 64, offsetX: -4, ...piece(blusinhasPiece) },
  picanha: { kind: 'picanha', width: 64, offsetX: -4, ...piece(picanhaPiece), move: [50, 1] },
  lona: { kind: 'lona', width: 64, offsetX: -6, ...piece(lonaPiece) },
  faixas: { kind: 'faixas', width: 64, offsetX: -4, ...piece(faixaPiece), open: [30, 1.4] },
  outdoor: { kind: 'outdoor', width: 64, offsetX: -8, ...piece(outdoorPiece) },
  livros: { kind: 'livros', width: 64, offsetX: -4, ...piece(livrosPiece), move: [35, 1.3] },
  marco: { kind: 'marco', width: 60, offsetX: -4, ...piece(marcoPiece) },
  relogio: { kind: 'relogio', width: 60, offsetX: -4, ...piece(relogioPiece), move: [40, 0.9] }
} satisfies Record<string, GateStyle>;

type Factory = (x: number, score: number) => Obstacle;

const playTop = 40;
const playBottom = WORLD.height - WORLD.groundHeight - 40;

const randomGapCenter = (gap: number) =>
  playTop + gap / 2 + rand() * (playBottom - playTop - gap);

/** Obstáculo de cima e de baixo com passagem um pouco mais larga (`extra`). */
const gate = (x: number, score: number, style: GateStyle, extra: number) =>
  new Gate(x, randomGapCenter(gapFor(score) + extra), gapFor(score) + extra, style);

/**
 * Obstáculos de cada parada. Dentro da fase, cada um entra a partir de certa
 * pontuação (contada desde a chegada à parada).
 */
const TABLES: Record<RegionId, { from: number; weight: number; make: Factory }[]> = {
  // Brasília: os de lá + os "dos partidos" (PT, PSOL e Missão), que só aparecem aqui
  brasilia: [
    { from: 0, weight: 3, make: (x, s) => new TogaBarrier(x, randomGapCenter(gapFor(s)), gapFor(s)) },
    { from: 0, weight: 2, make: (x, s) => gate(x, s, NEW_GATES.blusinhas, 10) },
    { from: 3, weight: 2, make: (x, s) => gate(x, s, NEW_GATES.livros, 20) },
    { from: 4, weight: 2, make: (x, s) => new Balloons(x, randomGapCenter(gapFor(s) + 20), gapFor(s) + 20) },
    { from: 6, weight: 2, make: (x, s) => gate(x, s, NEW_GATES.faixas, 30) },
    { from: 8, weight: 2, make: (x, s) => gate(x, s, NEW_GATES.picanha, 20) },
    { from: 10, weight: 2, make: (x, s) => new Gate(x, randomGapCenter(gapFor(s)), gapFor(s), GATES.cupulas) },
    { from: 12, weight: 2, make: (x, s) => gate(x, s, NEW_GATES.outdoor, 10) },
    { from: 14, weight: 2, make: (x, s) => gate(x, s, NEW_GATES.lona, 10) },
    { from: 16, weight: 2, make: (x) => new Spinner(x, 'estrela', 'estrela') },
    { from: 18, weight: 2, make: (x, s) => new DroneSwarm(x, randomGapCenter(gapFor(s) + 30), gapFor(s) + 30) },
    { from: 20, weight: 2, make: (x) => new Helicopter(x, playTop + 60 + rand() * (playBottom - playTop - 120)) },
    { from: 24, weight: 2, make: (x) => new Spinner(x, 'sol', 'sol') }
  ],
  iguazu: [
    { from: 0, weight: 3, make: (x, s) => new Gate(x, randomGapCenter(gapFor(s) + 30), gapFor(s) + 30, GATES.cataratas) },
    { from: 4, weight: 3, make: (x, s) => new Gate(x, randomGapCenter(gapFor(s) + 40), gapFor(s) + 40, GATES.cancela) },
    { from: 6, weight: 2, make: (x, s) => gate(x, s, NEW_GATES.marco, 20) },
    { from: 10, weight: 2, make: (x) => makeQuati(x) },
    { from: 14, weight: 2, make: (x) => makeToucans(x) },
    { from: 18, weight: 2, make: (x) => makeCuia(x) },
    { from: 22, weight: 2, make: (x) => makeBoat(x) }
  ],
  guayaquil: [
    { from: 0, weight: 3, make: (x, s) => new Gate(x, randomGapCenter(gapFor(s)), gapFor(s), GATES.bananas) },
    { from: 4, weight: 2, make: (x) => makeIguana(x) },
    { from: 6, weight: 2, make: (x, s) => gate(x, s, NEW_GATES.relogio, 20) },
    { from: 10, weight: 2, make: (x) => new FerrisWheel(x) },
    { from: 14, weight: 2, make: (x) => makeBoobies(x) },
    { from: 18, weight: 2, make: (x, s) => new Radar(x, gapFor(s)) },
    { from: 22, weight: 2, make: (x) => makeHat(x) }
  ],
  miami: [
    { from: 0, weight: 3, make: (x, s) => new Gate(x, randomGapCenter(gapFor(s) + 20), gapFor(s) + 20, GATES.predios) },
    { from: 4, weight: 2, make: (x) => new Pelicans(x, playTop + 80 + rand() * (playBottom - playTop - 220)) },
    { from: 7, weight: 2, make: (x) => makeFlamingos(x) },
    { from: 10, weight: 2, make: (x) => makeGator(x) },
    { from: 14, weight: 2, make: (x) => new TowPlane(x, playTop + 60 + rand() * (playBottom - playTop - 160)) },
    { from: 18, weight: 2, make: (x) => new Searchlight(x) },
    { from: 22, weight: 2, make: (x) => new Rocket(x) }
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
