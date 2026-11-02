import { WORLD } from '@/core/config';
import { rand } from '@/core/random';
import { PX } from '@/render/pixel';
import type { RegionId } from '@/render/stages';
import { lowQuality, settings } from './settings';

/**
 * CLIMA POR PARADA: de vez em quando o tempo fecha por uns 15 s.
 * - Brasília: chuva (o jatinho fica um pouco mais pesado).
 * - Puerto Iguazú: névoa das Cataratas (os obstáculos aparecem mais tarde).
 * - Guayaquil: ventania que vem dos Andes (empurra para cima e para baixo).
 * - Miami: tempestade tropical (chuva forte, raios e rajadas).
 */
export type WeatherId = 'chuva' | 'nevoa' | 'ventania' | 'tempestade';

export const WEATHER: Record<WeatherId, { name: string; region: RegionId; weight: number; wind: number }> = {
  chuva: { name: 'Chuva em Brasília', region: 'brasilia', weight: 1.12, wind: 0 },
  nevoa: { name: 'Névoa das Cataratas', region: 'iguazu', weight: 1, wind: 0 },
  ventania: { name: 'Ventania dos Andes', region: 'guayaquil', weight: 1, wind: 360 },
  tempestade: { name: 'Tempestade tropical', region: 'miami', weight: 1.08, wind: 260 }
};

export const weatherFor = (region: RegionId): WeatherId =>
  (Object.keys(WEATHER) as WeatherId[]).find((id) => WEATHER[id].region === region)!;

const DURATION = 15;

export class Weather {
  private time = 0;
  private drops: { x: number; y: number; v: number }[] = [];
  private flash = 0;

  constructor(readonly id: WeatherId) {
    const heavy = id === 'tempestade';
    if (id === 'chuva' || heavy) {
      for (let i = 0; i < (heavy ? 90 : 55) * (lowQuality() ? 0.4 : 1); i++) this.drops.push({ x: rand() * WORLD.width, y: rand() * WORLD.height, v: 500 + rand() * 250 });
    }
    if (id === 'ventania') {
      for (let i = 0; i < (lowQuality() ? 16 : 40); i++) this.drops.push({ x: rand() * WORLD.width, y: rand() * WORLD.height, v: 380 + rand() * 200 });
    }
  }

  get done(): boolean {
    return this.time >= DURATION;
  }

  /** 0 → 1 → 0 (entra e sai devagar). */
  get strength(): number {
    return Math.max(0, Math.min(1, this.time / 1.5, (DURATION - this.time) / 1.5));
  }

  /** Multiplicador da gravidade do jatinho. */
  get weight(): number {
    return 1 + (WEATHER[this.id].weight - 1) * this.strength;
  }

  /** Força vertical do vento agora (px/s²). */
  get wind(): number {
    const w = WEATHER[this.id].wind;
    if (!w) return 0;
    return Math.sin(this.time * 1.7) * Math.sin(this.time * 0.6 + 1) * w * this.strength;
  }

  update(dt: number): void {
    this.time += dt;
    const slant = this.id === 'ventania' ? 0 : this.id === 'tempestade' ? -0.35 : -0.15;
    for (const d of this.drops) {
      if (this.id === 'ventania') {
        d.x -= d.v * dt;
        d.y += Math.sin(this.time * 2 + d.x * 0.02) * 40 * dt;
      } else {
        d.y += d.v * dt;
        d.x += d.v * slant * dt;
      }
      if (d.y > WORLD.height) d.y -= WORLD.height + 20;
      if (d.x < -20) d.x += WORLD.width + 40;
    }
    if (this.id === 'tempestade') {
      this.flash = Math.max(0, this.flash - dt * 3);
      if (rand() < dt * 0.35 && this.strength > 0.8 && !settings.reduceEffects) this.flash = 1;
    }
  }

  /** Desenha por cima do cenário e dos obstáculos (antes do HUD). */
  render(ctx: CanvasRenderingContext2D): void {
    const a = this.strength;
    if (a <= 0) return;
    if (this.id === 'nevoa') {
      // névoa mais grossa à direita: os obstáculos surgem de dentro dela
      for (let x = 120; x < WORLD.width; x += PX * 4) {
        const t = (x - 120) / (WORLD.width - 120);
        ctx.fillStyle = `rgba(236, 244, 250, ${(0.15 + t * 0.8) * a})`;
        ctx.fillRect(x, 0, PX * 4, WORLD.height - WORLD.groundHeight);
      }
      return;
    }
    if (this.id === 'chuva' || this.id === 'tempestade') {
      ctx.fillStyle = `rgba(20, 30, 60, ${(this.id === 'tempestade' ? 0.3 : 0.15) * a})`;
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);
      ctx.fillStyle = `rgba(190, 215, 255, ${0.75 * a})`;
      for (const d of this.drops) {
        for (let i = 0; i < 4; i++) ctx.fillRect(Math.round(d.x + i * (this.id === 'tempestade' ? 2 : 1)) & ~1, Math.round(d.y - i * PX * 2) & ~1, PX, PX * 2);
      }
    }
    if (this.id === 'ventania') {
      ctx.fillStyle = `rgba(20, 40, 90, ${0.12 * a})`;
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);
      for (const d of this.drops) {
        const x = Math.round(d.x) & ~1;
        const y = Math.round(d.y) & ~1;
        ctx.fillStyle = `rgba(40, 60, 110, ${0.55 * a})`;
        ctx.fillRect(x, y + PX, 34, PX);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * a})`;
        ctx.fillRect(x, y, 34, PX);
        ctx.fillRect(x + 34, y - PX, 8, PX); // pontinha enrolando
      }
    }
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 240, ${this.flash * 0.6})`;
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    }
  }
}

/** Sorteio: em cada parada, 60% de chance de o tempo fechar uma vez, entre 8 e 20 s depois de chegar. */
export function rollWeather(force = false): number | null {
  if (!force && rand() > 0.6) return null;
  return force ? 3 : 8 + rand() * 12;
}

export { DURATION as WEATHER_SECONDS };

/** Ícone para a Coleção (64x40, pixels da arte). */
export function weatherIcon(id: WeatherId): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 40;
  const ctx = c.getContext('2d')!;
  const sky = { chuva: '#5a6f8f', nevoa: '#b9c8d6', ventania: '#7fb2ff', tempestade: '#2b2f4a' }[id];
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 64, 40);
  const cloud = (x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 3, 22, 7);
    ctx.fillRect(x + 4, y, 10, 4);
    ctx.fillRect(x + 12, y + 1, 7, 3);
  };
  if (id === 'chuva' || id === 'tempestade') {
    cloud(8, 4, id === 'chuva' ? '#d9e2ee' : '#5a5f7a');
    cloud(34, 8, id === 'chuva' ? '#c9d4e3' : '#4a4f6a');
    ctx.fillStyle = '#bed7ff';
    for (let i = 0; i < 16; i++) ctx.fillRect(4 + ((i * 7) % 56), 18 + ((i * 5) % 18), 1, 3);
    if (id === 'tempestade') {
      ctx.fillStyle = '#ffd23f';
      for (const [x, y] of [[30, 16], [29, 18], [28, 20], [30, 20], [31, 21], [30, 23], [29, 25]]) ctx.fillRect(x, y, 2, 2);
    }
  } else if (id === 'nevoa') {
    for (let y = 6; y < 38; y += 6) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(((y * 3) % 10) + 2, y, 50, 3);
    }
  } else {
    ctx.fillStyle = '#ffffff';
    for (const [x, y, w] of [[6, 10, 30], [20, 18, 36], [10, 26, 26], [30, 32, 24]]) ctx.fillRect(x, y, w, 2);
    ctx.fillStyle = '#e9edf2';
    ctx.fillRect(44, 6, 12, 6); // neve nos Andes
  }
  return c;
}

export const WEATHER_IDS = Object.keys(WEATHER) as WeatherId[];
