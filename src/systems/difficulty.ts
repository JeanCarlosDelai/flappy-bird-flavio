import { OBSTACLES } from '@/core/config';
import { testMode } from './test-mode';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function speedFor(score: number): number {
  const speed = clamp(OBSTACLES.baseSpeed + score * OBSTACLES.speedPerPoint, 0, OBSTACLES.maxSpeed);
  return speed * (testMode?.speed ?? 1); // MODO TESTE
}

export function intervalFor(score: number): number {
  return clamp(OBSTACLES.baseInterval - score * 0.0065, OBSTACLES.minInterval, OBSTACLES.baseInterval);
}

export function gapFor(score: number): number {
  return clamp(OBSTACLES.gapStart - score * 0.5, OBSTACLES.gapMin, OBSTACLES.gapStart);
}
