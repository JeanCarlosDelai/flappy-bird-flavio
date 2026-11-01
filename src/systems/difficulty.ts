import { OBSTACLES } from '@/core/config';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function speedFor(score: number): number {
  return clamp(OBSTACLES.baseSpeed + score * OBSTACLES.speedPerPoint, 0, OBSTACLES.maxSpeed);
}

export function intervalFor(score: number): number {
  return clamp(OBSTACLES.baseInterval - score * 0.0065, OBSTACLES.minInterval, OBSTACLES.baseInterval);
}

export function gapFor(score: number): number {
  return clamp(OBSTACLES.gapStart - score * 0.5, OBSTACLES.gapMin, OBSTACLES.gapStart);
}
