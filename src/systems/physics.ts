import { JET } from '@/core/config';

export interface Body {
  y: number;
  vy: number;
}

/** `sign` = -1 inverte a gravidade (evento "Gravidade suspensa por liminar"). */
export function applyGravity(body: Body, dt: number, sign = 1): void {
  const vy = body.vy + JET.gravity * sign * dt;
  body.vy = Math.max(-JET.maxFallSpeed, Math.min(vy, JET.maxFallSpeed));
  body.y += body.vy * dt;
}

export function flap(body: Body, sign = 1): void {
  body.vy = JET.flapImpulse * sign;
}
