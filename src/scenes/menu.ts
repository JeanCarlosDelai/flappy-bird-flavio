import { WORLD } from '@/core/config';
import { Jet } from '@/entities/jet';
import { Background } from '@/render/background';
import { outlinedText, panel } from '@/render/text';
import { loadHistory } from '@/systems/session';
import type { FrameInput } from '@/core/input';
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
  }

  update(dt: number, input: FrameInput): void {
    const { pressed } = input;
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

    outlinedText(ctx, 'JATINHO', WORLD.width / 2, 120, 48, '#ffdf00');
    outlinedText(ctx, 'DO FLÁVIO', WORLD.width / 2, 168, 40, '#fff');

    panel(ctx, 340, 152);
    ctx.fillStyle = '#fff';
    ctx.font = '600 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Toque para voar.', WORLD.width / 2, 368);
    ctx.fillText('Cada batida deixa o perseguidor', WORLD.width / 2, 394);
    ctx.fillText('mais perto. Não encoste no chão!', WORLD.width / 2, 416);
    ctx.fillStyle = '#c9d1e3';
    ctx.font = '500 12px system-ui, sans-serif';
    ctx.fillText('Esc ou ⏸ pausa e mostra o mapa', WORLD.width / 2, 436);
    ctx.fillStyle = '#ffdf00';
    ctx.font = '600 15px system-ui, sans-serif';
    ctx.fillText(`Recorde: ${this.best}`, WORLD.width / 2, 464);

    if (Math.floor(this.time * 2) % 2 === 0) {
      outlinedText(ctx, 'TOQUE PARA DECOLAR', WORLD.width / 2, 530, 20);
    }
  }
}
