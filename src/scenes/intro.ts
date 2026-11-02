import { WORLD } from '@/core/config';
import type { FrameInput } from '@/core/input';
import { CHASERS, drawChaser } from '@/entities/chaser';
import { VARIANTS } from '@/entities/chaser-sprites';
import { flavioSprite } from '@/entities/cutscene';
import { jetSprite } from '@/entities/jet';
import { Background } from '@/render/background';
import { drawSprite, drawSpriteAt, PX } from '@/render/pixel';
import { wrapPixelText } from '@/render/pixel-font';
import { outlinedText, panel, plainText } from '@/render/text';
import { music } from '@/audio/music';
import { sfx } from '@/audio/sfx';
import { drawSoundButton, toggleSound } from '@/ui/sound-button';
import type { PlayOptions, Scene, SceneManager } from './scene';

/**
 * INTRODUÇÃO (antes da primeira partida, ~6,5 s; um toque pula):
 * o Flávio atravessa a pista de Brasília com a mala e entra no jatinho, aparece a manchete da
 * fuga, o jatinho decola e os perseguidores chegam correndo atrasados.
 */
const KEY = 'jatinho-do-flavio:intro';
export const introSeen = (): boolean => {
  try {
    return globalThis.localStorage?.getItem(KEY) === '1';
  } catch {
    return true;
  }
};
export const setIntroSeen = (seen: boolean): void => {
  try {
    if (seen) globalThis.localStorage?.setItem(KEY, '1');
    else globalThis.localStorage?.removeItem(KEY);
  } catch {
    // sem storage
  }
};

const DURATION = 6.6;
const groundY = WORLD.height - WORLD.groundHeight;
const ease = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

export class IntroScene implements Scene {
  private time = 0;
  private background = new Background();
  private done = false;
  private roared = false;

  constructor(private manager: SceneManager, private options?: PlayOptions) {
    music.play('brasilia');
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    setIntroSeen(true);
    this.manager.goToPlay(this.options);
  }

  update(dt: number, input: FrameInput): void {
    if (input.sound) toggleSound();
    this.time += dt;
    // cenário anda devagar no começo e acelera na decolagem
    this.background.update(dt, this.time < 3.6 ? 0 : 60 + (this.time - 3.6) * 120);
    if (!this.roared && this.time > 3.6) {
      this.roared = true;
      sfx.region();
    }
    if ((input.pressed && this.time > 0.6) || this.time >= DURATION) this.finish();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const t = this.time;
    this.background.render(ctx, 0);

    // pista
    ctx.fillStyle = '#3c444f';
    ctx.fillRect(0, groundY - 8, WORLD.width, 12);
    ctx.fillStyle = '#f7f7f7';
    const dash = t < 3.6 ? 0 : ((t - 3.6) * 240) % 40;
    for (let x = -dash; x < WORLD.width; x += 40) ctx.fillRect(Math.round(x), groundY - 3, 20, PX);

    // jatinho: parado, depois corre e decola
    const lift = ease((t - 3.6) / 2.2);
    const jx = 220 + lift * 220;
    const jy = groundY - 26 - lift * 300;
    drawSprite(ctx, jetSprite(t < 3.6 ? 0 : -0.35 * lift, Math.floor(t * 12) % 2, 'classico'), jx, jy, PX * 1.4);

    // Flávio atravessa a pista com a mala e entra no avião
    if (t < 2.4) {
      const walk = ease(t / 2.2);
      const fx = 20 + walk * 150;
      const alpha = t > 2.0 ? Math.max(0, 1 - (t - 2.0) / 0.4) : 1;
      ctx.globalAlpha = alpha;
      drawSpriteAt(ctx, flavioSprite(Math.floor(t * 8) % 2), fx, groundY - 52, PX);
      ctx.fillStyle = '#1b1420';
      ctx.fillRect(Math.round(fx + 26), groundY - 30, 16, 14);
      ctx.fillStyle = '#8a5a33';
      ctx.fillRect(Math.round(fx + 28), groundY - 28, 12, 10); // mala
      ctx.fillRect(Math.round(fx + 31), groundY - 32, 6, 2);
      ctx.globalAlpha = 1;
    }

    // manchete
    if (t > 1.8 && t < 4.6) {
      const slide = ease((t - 1.8) / 0.4) * (1 - ease((t - 4.2) / 0.4));
      ctx.save();
      ctx.translate(0, Math.round((1 - slide) * -220));
      panel(ctx, 70, 150, 20, WORLD.width - 40);
      ctx.fillStyle = '#d33a2c';
      ctx.fillRect(40, 86, 74, 18);
      plainText(ctx, 'URGENTE', 77, 95, 2, '#ffffff');
      wrapPixelText('FLÁVIO DEIXA O PAÍS DE JATINHO', WORLD.width - 80, 3).forEach((l, i) =>
        outlinedText(ctx, l, WORLD.width / 2, 130 + i * 26, 3, '#ffd23f')
      );
      plainText(ctx, 'Destino: Miami. E tem gente na cola.', WORLD.width / 2, 196, 1.5, '#c9d1e3');
      ctx.restore();
    }

    // perseguidores chegam correndo, atrasados
    if (t > 4.0) {
      (['lula', 'xandao', 'janja'] as const).forEach((id, i) => {
        const profile = CHASERS.find((c) => c.id === id)!;
        const run = ease((t - 4.0 - i * 0.2) / 1.2);
        const bob = Math.abs(Math.sin(t * 10 + i)) * 4;
        drawChaser(ctx, profile, VARIANTS[id][0], -40 + run * (70 + i * 50), groundY - 40 - bob, 1.2);
      });
      if (t > 4.6) outlinedText(ctx, 'VOLTA AQUI!', 110, groundY - 110, 2, '#ff8a8a');
    }

    if (t > 5.4) {
      const a = Math.min(1, (t - 5.4) * 3);
      ctx.globalAlpha = a;
      outlinedText(ctx, 'FUJA ATÉ MIAMI!', WORLD.width / 2, 200, 4, '#ffffff');
      plainText(ctx, 'Toque para subir', WORLD.width / 2, 236, 2, '#ffd23f');
      ctx.globalAlpha = 1;
    }

    if (t > 0.6) plainText(ctx, 'toque para pular', WORLD.width / 2, WORLD.height - 14, 1.5, 'rgba(255,255,255,0.7)');
    drawSoundButton(ctx);
  }
}
