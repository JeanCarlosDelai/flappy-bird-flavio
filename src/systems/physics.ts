import { JET } from '@/core/config';

export interface Body {
  y: number;
  vy: number;
}

export function applyGravity(body: Body, dt: number): void {
  body.vy = Math.min(body.vy + JET.gravity * dt, JET.maxFallSpeed);
  body.y += body.vy * dt;
}

export function flap(body: Body): void {
  body.vy = JET.flapImpulse;
}
