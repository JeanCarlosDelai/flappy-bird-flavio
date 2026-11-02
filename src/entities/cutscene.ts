import { JET, WORLD } from '@/core/config';
import { drawSprite, drawSpriteAt, PixelGrid, PX } from '@/render/pixel';
import { outlinedText, plainText } from '@/render/text';
import { STAGES } from '@/render/stages';
import { attackSprite } from './attacks';
import { CHASERS, drawChaser } from './chaser';
import { VARIANTS } from './chaser-sprites';
import { jetSprite } from './jet';
import { lowQuality, settings } from '@/systems/settings';
import type { ChaserProfile } from './chaser';
import type { ChaserVariant } from './chaser-sprites';

/**
 * CENAS CURTAS do fim da partida:
 * - captura: o perseguidor alcança o jatinho, algemas e "PEGO!";
 * - pouso forçado: fumaça no chão;
 * - final em Miami: pouso, o Flávio desce a escada e os perseguidores chegam atrasados.
 */
const OUT = '#1b1420';
const groundY = WORLD.height - WORLD.groundHeight;
const cache = new Map<string, HTMLCanvasElement>();
const cached = (key: string, build: () => PixelGrid) => {
  let c = cache.get(key);
  if (!c) {
    c = build().outline(OUT).toCanvas();
    cache.set(key, c);
  }
  return c;
};
const ease = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

/** Flávio de corpo inteiro (andando: 2 quadros; acenando: 2). */
export const flavioSprite = (frame: number, waving = false) =>
  cached(`flavio:${frame}:${waving}`, () => {
    const g = new PixelGrid(14, 22);
    g.rect(4, 0, 6, 2, '#3b2a1e').rect(3, 2, 8, 6, '#e8b48f').rect(3, 1, 2, 3, '#3b2a1e');
    g.rect(4, 4, 6, 1, '#191920'); // óculos escuros
    g.rect(6, 6, 3, 1, '#7a3b33');
    g.rect(3, 8, 8, 7, '#24304f').rect(6, 8, 2, 4, '#f7f7f7').rect(7, 9, 1, 3, '#d33a2c'); // terno
    if (waving) {
      g.rect(11, frame ? 3 : 5, 2, 6, '#24304f').rect(11, frame ? 1 : 3, 2, 2, '#e8b48f');
      g.rect(1, 9, 2, 5, '#24304f');
    } else {
      g.rect(1, 9, 2, 5, '#24304f').rect(11, 9, 2, 5, '#24304f');
    }
    g.rect(1, 14, 2, 1, '#e8b48f').rect(11, 14, 2, 1, '#e8b48f');
    const step = frame && !waving;
    g.rect(4, 15, 2, step ? 6 : 7, '#191920').rect(8, 15, 2, step ? 7 : 6, '#191920');
    g.rect(3, 21, 3, 1, '#3b2a1e').rect(8, 21, 3, 1, '#3b2a1e');
    return g;
  });

const stairsSprite = () =>
  cached('escada', () => {
    const g = new PixelGrid(16, 20);
    for (let i = 0; i < 5; i++) g.rect(i * 3, i * 4, 16 - i * 3, 4, i % 2 ? '#c9d1dc' : '#e9edf2');
    g.rect(0, 0, 1, 20, '#9aa3b5');
    return g;
  });

const runway = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#3c444f';
  ctx.fillRect(0, groundY - 6, WORLD.width, 10);
  ctx.fillStyle = '#f7f7f7';
  for (let x = 10; x < WORLD.width; x += 40) ctx.fillRect(x, groundY - 2, 20, PX);
};

// ---------- captura ----------

export const CAPTURE_SECONDS = 1.9;

export function renderCapture(ctx: CanvasRenderingContext2D, t: number, jetY: number, chaserName: string): void {
  // escurece em volta
  ctx.fillStyle = `rgba(11, 13, 30, ${Math.min(0.55, t * 0.6)})`;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  // algemas caindo no jatinho
  if (t > 0.45) {
    const drop = ease((t - 0.45) / 0.35);
    drawSprite(ctx, attackSprite.algema(Math.floor(t * 10) % 2), JET.x, jetY - 60 + drop * 50, PX * 1.5);
  }
  if (t > 0.7) {
    const pop = Math.min(1, (t - 0.7) * 5);
    outlinedText(ctx, 'PEGO!', WORLD.width / 2, 200, Math.round(6 + pop * 4), '#ff3b3b');
    plainText(ctx, `${chaserName.toUpperCase()} ALCANÇOU O JATINHO`, WORLD.width / 2, 250, 1.5, '#ffffff');
  }
}

// ---------- pouso forçado ----------

export const CRASH_SECONDS = 1.1;

export function renderCrash(ctx: CanvasRenderingContext2D, t: number, jetY: number): void {
  for (let i = 0; i < 7; i++) {
    const age = t * 1.4 - i * 0.12;
    if (age <= 0) continue;
    const r = 6 + age * 26;
    ctx.fillStyle = `rgba(90, 90, 100, ${Math.max(0, 0.7 - age * 0.5)})`;
    ctx.fillRect(Math.round(JET.x - 30 + i * 9 - r / 2), Math.round(jetY - age * 40 - r / 2), Math.round(r), Math.round(r));
  }
  if (t > 0.3) outlinedText(ctx, 'POUSO FORÇADO!', WORLD.width / 2, 210, 4, '#ffd23f');
}

// ---------- final em Miami ----------

export const ESCAPE_SECONDS = 7.5;

/** Velocidade do cenário durante o final (o avião freia até parar). */
export const escapeScroll = (t: number, speed: number) => speed * (1 - ease((t - 0.4) / 2.6));

const LATE: [ChaserProfile, ChaserVariant][] = (['interpol', 'xandao', 'lula', 'kim'] as const).map((id) => {
  const profile = CHASERS.find((c) => c.id === id)!;
  return [profile, VARIANTS[id][id === 'kim' ? 0 : 1]];
});

export function renderEscape(ctx: CanvasRenderingContext2D, t: number, startY: number, flame: number): void {
  runway(ctx);
  // o avião desce até a pista e anda até o meio da tela
  const land = ease(t / 2.6);
  const planeX = JET.x + land * 80;
  const planeY = startY + (groundY - 22 - startY) * land;
  const angle = t < 2.6 ? 0.12 * (1 - land) : 0;
  drawSprite(ctx, jetSprite(angle, t < 3 ? flame : 0), planeX, planeY, PX);

  // escada e Flávio descendo
  if (t > 3) {
    drawSpriteAt(ctx, stairsSprite(), planeX - 24, groundY - 40, PX);
    const walk = Math.min(1, (t - 3.2) / 1.2);
    const fx = planeX - 4 - walk * 60;
    const fy = groundY - 64 + walk * 20;
    const waving = t > 4.6;
    if (t > 3.2) drawSpriteAt(ctx, flavioSprite(Math.floor(t * 6) % 2, waving), fx - 14, waving ? groundY - 44 : fy, PX);
  }

  // perseguidores chegando atrasados, correndo pela esquerda
  if (t > 4.2) {
    LATE.forEach(([profile, variant], i) => {
      const run = ease((t - 4.2 - i * 0.25) / 1.4);
      if (run <= 0) return;
      const x = -40 + run * (40 + i * 26);
      const bob = Math.abs(Math.sin(t * 10 + i)) * 4 * (run < 1 ? 1 : 0);
      drawChaser(ctx, profile, variant, x, groundY - 40 - bob - i * 2, 1.2);
    });
    if (t > 5.2) plainText(ctx, 'CHEGARAM ATRASADOS!', WORLD.width / 2, 300, 2, '#ffffff');
  }

  if (t > 5.6) {
    const pop = Math.min(1, (t - 5.6) * 4);
    outlinedText(ctx, 'FUGA', WORLD.width / 2, 170, Math.round(5 + pop * 3), '#ffd23f');
    outlinedText(ctx, 'CONCLUÍDA!', WORLD.width / 2, 222, Math.round(4 + pop * 2), '#ffffff');
    // confete
    const confetti = settings.reduceEffects ? 0 : lowQuality() ? 14 : 40;
    for (let i = 0; i < confetti; i++) {
      const x = (i * 53 + t * 40 * ((i % 3) + 1)) % WORLD.width;
      const y = ((i * 97) % 300) + ((t - 5.6) * 120 * ((i % 4) + 1)) % 400;
      ctx.fillStyle = ['#ffd23f', '#ff5a8a', '#7bd389', '#4fc3f7'][i % 4];
      ctx.fillRect(Math.round(x) & ~1, Math.round(y) & ~1, PX * 2, PX * 2);
    }
  }
  if (t < 1.5) plainText(ctx, `POUSANDO EM ${STAGES[3].name.toUpperCase()}...`, WORLD.width / 2, 200, 2, '#ffffff');
}
