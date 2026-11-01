import { WORLD } from '@/core/config';
import { Jet } from '@/entities/jet';
import { Background } from '@/render/background';
import { outlinedText, panel, plainText } from '@/render/text';
import { loadHistory } from '@/systems/session';
import type { FrameInput } from '@/core/input';
import { music } from '@/audio/music';
import { drawSoundButton, toggleSound } from '@/ui/sound-button';
import type { Scene, SceneManager } from './scene';

export class MenuScene implements Scene {
  private jet = new Jet(WORLD.height * 0.42);
  private background = new Background();
  private time = 0;
  private best = loadHistory().best;

  private link: HTMLAnchorElement;

  constructor(private manager: SceneManager) {
    this.link = document.createElement('a');
    this.link.className = 'menu-link';
    this.link.href = './ranking.html';
    this.link.textContent = '🏆 Ranking e estatísticas';
    document.body.append(this.link);
    music.play('menu');
  }

  update(dt: number, input: FrameInput): void {
    const { pressed } = input;
    if (input.sound) toggleSound();
    this.time += dt;
    this.background.update(dt, 60);
    this.jet.idle(dt, WORLD.height * 0.42);
    if (pressed && this.time > 0.2) {
      this.link.remove();
      this.manager.goToPlay();
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.background.render(ctx, 0);
    this.jet.render(ctx);
    drawSoundButton(ctx);

    outlinedText(ctx, 'JATINHO', WORLD.width / 2, 110, 10, '#ffd23f');
    outlinedText(ctx, 'DO FLÁVIO', WORLD.width / 2, 168, 6, '#ffffff');

    panel(ctx, 336, 136);
    plainText(ctx, 'Toque para voar', WORLD.width / 2, 362, 3, '#ffffff');
    plainText(ctx, 'Cada batida deixa', WORLD.width / 2, 392, 2, '#c9d1e3');
    plainText(ctx, 'o perseguidor mais perto', WORLD.width / 2, 408, 2, '#c9d1e3');
    plainText(ctx, 'Esc pausa · M liga/desliga som', WORLD.width / 2, 428, 2, '#8f9bb5');
    plainText(ctx, `Recorde: ${this.best}`, WORLD.width / 2, 452, 3, '#ffd23f');

    if (Math.floor(this.time * 2) % 2 === 0) {
      outlinedText(ctx, 'Toque para decolar', WORLD.width / 2, 520, 3);
    }
  }
}
