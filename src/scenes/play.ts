import { CHASER, JET, WORLD } from '@/core/config';
import { PAUSE_BUTTON, type FrameInput } from '@/core/input';
import { Chaser, chaserForScore } from '@/entities/chaser';
import { Jet } from '@/entities/jet';
import type { Obstacle } from '@/entities/obstacles';
import { Background } from '@/render/background';
import { drawRouteMap, routeStatus } from '@/render/map';
import { STAGES, stageIndexForScore } from '@/render/stages';
import { outlinedText, panel } from '@/render/text';
import { intersectsAny } from '@/systems/collision';
import { speedFor } from '@/systems/difficulty';
import type { RunStats } from '@/systems/session';
import { Spawner } from '@/systems/spawner';
import type { Scene, SceneManager } from './scene';

const RADAR_ALERT = 0.12;

export class PlayScene implements Scene {
  private jet = new Jet(WORLD.height * 0.42);
  private obstacles: Obstacle[] = [];
  private spawner = new Spawner();
  private background = new Background();
  private chaser = new Chaser(chaserForScore(0));
  private alerted = new WeakSet<Obstacle>();
  private score = 0;
  private flash = 0;
  private banner: { text: string; time: number } | null = { text: STAGES[0].name, time: 1.6 };
  private started = false;
  private paused = false;
  private ended = false;
  private elapsedMs = 0;
  private hits = 0;
  private radarAlerts = 0;
  private hitsByObstacle: RunStats['hitsByObstacle'] = {};

  constructor(private manager: SceneManager) {}

  update(dt: number, input: FrameInput): void {
    if (this.ended) return;

    if (input.pause && this.started) {
      this.paused = !this.paused;
      return;
    }
    if (this.paused) {
      // tocar na tela também volta ao jogo
      if (input.pressed) this.paused = false;
      return;
    }

    // até o primeiro toque o jatinho fica flutuando
    if (!this.started) {
      this.jet.idle(dt, WORLD.height * 0.42);
      this.background.update(dt, 60);
      if (input.pressed) {
        this.started = true;
        this.jet.flap();
      }
      return;
    }

    if (input.pressed) this.jet.flap();

    this.elapsedMs += dt * 1000;
    const speed = speedFor(this.score);
    this.jet.update(dt);
    this.background.update(dt, speed);
    this.chaser.update(dt);
    this.flash = Math.max(0, this.flash - dt);
    if (this.banner) {
      this.banner.time -= dt;
      if (this.banner.time <= 0) this.banner = null;
    }

    this.spawner.update(dt, this.score, (o) => this.obstacles.push(o));
    for (const o of this.obstacles) o.update(dt, speed);
    this.obstacles = this.obstacles.filter((o) => !o.offscreen);

    this.checkCollisions();
    this.checkScore();

    // teto: só segura; chão: cai e acabou
    if (this.jet.y < JET.height) {
      this.jet.y = JET.height;
      this.jet.vy = 0;
    }
    if (this.jet.y + JET.height / 2 >= WORLD.height - WORLD.groundHeight) {
      this.finish('chao');
    } else if (this.chaser.caught) {
      this.finish(this.chaser.profile.id);
    }
  }

  private checkCollisions(): void {
    const box = this.jet.hitbox;
    const hitBy = this.jet.invulnerable <= 0 ? this.obstacles.find((o) => intersectsAny(box, o.hitboxes)) : undefined;
    if (hitBy) {
      this.hits++;
      this.hitsByObstacle[hitBy.kind] = (this.hitsByObstacle[hitBy.kind] ?? 0) + 1;
      this.jet.hit();
      this.chaser.bump(CHASER.hitThreat);
      this.flash = 0.25;
    }
    for (const o of this.obstacles) {
      if (!this.alerted.has(o) && intersectsAny(box, o.alertZones)) {
        this.alerted.add(o);
        this.radarAlerts++;
        this.chaser.bump(RADAR_ALERT);
        this.banner = { text: 'Radar te viu!', time: 0.9 };
      }
    }
  }

  private checkScore(): void {
    for (const o of this.obstacles) {
      if (!o.passed && o.x + o.width < JET.x - JET.width / 2) {
        o.passed = true;
        this.score++;
        this.onScoreChanged();
      }
    }
  }

  private onScoreChanged(): void {
    const next = chaserForScore(this.score);
    if (next !== this.chaser.profile) {
      this.chaser = new Chaser(next);
      this.banner = { text: `${next.name} entrou na perseguição!`, time: 1.8 };
    }
    const stage = STAGES.find((s) => s.fromScore === this.score && s.fromScore > 0);
    if (stage) this.banner = { text: stage.name, time: 1.6 };
  }

  private finish(cause: RunStats['cause']): void {
    this.ended = true;
    this.manager.goToGameOver({
      score: this.score,
      durationMs: Math.round(this.elapsedMs),
      hits: this.hits,
      radarAlerts: this.radarAlerts,
      cause,
      hitsByObstacle: this.hitsByObstacle
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.background.render(ctx, this.score);
    for (const o of this.obstacles) o.render(ctx);
    this.jet.render(ctx);
    if (this.started) this.chaser.render(ctx, this.jet.y);

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 50, 50, ${this.flash})`;
      ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    }

    outlinedText(ctx, String(this.score), WORLD.width / 2, 80, 52);

    if (!this.started) {
      outlinedText(ctx, 'Toque para começar', WORLD.width / 2, WORLD.height * 0.62, 22);
    } else if (this.banner && !this.paused) {
      ctx.globalAlpha = Math.min(1, this.banner.time * 2);
      outlinedText(ctx, this.banner.text, WORLD.width / 2, 150, 22, '#ffdf00');
      ctx.globalAlpha = 1;
    }

    if (this.started) this.renderPauseButton(ctx);
    if (this.paused) this.renderPause(ctx);
  }

  private renderPauseButton(ctx: CanvasRenderingContext2D): void {
    const b = PAUSE_BUTTON;
    ctx.fillStyle = 'rgba(11, 29, 58, 0.55)';
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    if (this.paused) {
      ctx.beginPath();
      ctx.moveTo(b.x + 15, b.y + 11);
      ctx.lineTo(b.x + 29, b.y + 20);
      ctx.lineTo(b.x + 15, b.y + 29);
      ctx.fill();
    } else {
      ctx.fillRect(b.x + 13, b.y + 11, 5, 18);
      ctx.fillRect(b.x + 22, b.y + 11, 5, 18);
    }
  }

  private renderPause(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    outlinedText(ctx, 'PAUSADO', WORLD.width / 2, 140, 44, '#ffdf00');

    panel(ctx, 190, 270);
    outlinedText(ctx, 'Rota de fuga', WORLD.width / 2, 216, 18);
    drawRouteMap(ctx, 46, 236, WORLD.width - 92, 150, {
      revealUpTo: stageIndexForScore(this.score),
      score: this.score
    });
    ctx.fillStyle = '#fff';
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(routeStatus(this.score), WORLD.width / 2, 408);
    ctx.fillStyle = '#c9d1e3';
    ctx.fillText(`${this.chaser.profile.name} na sua cola`, WORLD.width / 2, 432);

    outlinedText(ctx, 'Esc ou toque para continuar', WORLD.width / 2, 520, 17);
  }
}
