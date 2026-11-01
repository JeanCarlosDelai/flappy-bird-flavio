import { WORLD } from '@/core/config';
import type { FrameInput } from '@/core/input';
import { Background } from '@/render/background';
import { recordLocalRun, type RunStats } from '@/systems/session';
import { testMode } from '@/systems/test-mode';
import { addCoins, loadProgress, recordDaily } from '@/systems/progress';
import { evaluateMedals } from '@/systems/medals';
import { todaySeed } from '@/core/random';
import { showGameOverPanel } from '@/ui/gameover-panel';
import type { Scene, SceneManager } from './scene';
import { music } from '@/audio/music';
import { sfx } from '@/audio/sfx';
import { toggleSound } from '@/ui/sound-button';

export class GameOverScene implements Scene {
  private background = new Background();
  private time = 0;
  private closePanel: () => void;
  private score: number;
  private daily = false;

  constructor(private manager: SceneManager, run: RunStats) {
    this.score = run.score;
    const summary = recordLocalRun(run, !testMode); // MODO TESTE não salva recorde/estatísticas
    // moedas, medalhas e Desafio do dia
    addCoins(run.coins ?? 0);
    const medals = evaluateMedals(run, summary.history);
    const dailyBest = run.daily ? recordDaily(todaySeed(), run.score) : null;
    this.daily = !!run.daily;
    music.stop();
    if (run.cause === 'fuga') {
      sfx.region();
      sfx.record();
    } else {
      sfx.gameOver(run.cause !== 'chao');
      if (summary.newRecord && run.score > 0) sfx.record();
    }
    this.closePanel = showGameOverPanel(summary, () => this.retry(), {
      coinsTotal: loadProgress().coins,
      coinsRun: run.coins ?? 0,
      medals,
      dailyBest
    });
  }

  private retry(): void {
    this.closePanel();
    this.manager.goToPlay({ daily: this.daily });
  }

  update(dt: number, input: FrameInput): void {
    this.time += dt;
    if (input.sound) toggleSound();
    // trava curta para o toque que causou a queda não reiniciar na hora
    if (input.pressed && this.time > 0.8) this.retry();
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.background.render(ctx, this.score);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }
}
