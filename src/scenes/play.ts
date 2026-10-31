import { CHASER, JET, WORLD } from '@/core/config';
import { Chaser, chaserForScore } from '@/entities/chaser';
import { Jet } from '@/entities/jet';
import type { Obstacle } from '@/entities/obstacles';
import { Background } from '@/render/background';
import { outlinedText } from '@/render/text';
import { intersectsAny } from '@/systems/collision';
import { speedFor } from '@/systems/difficulty';
import { saveBest } from '@/systems/score';
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
  private banner: { text: string; time: number } | null = { text: 'Brasília', time: 1.6 };
  private started = false;
  private ended = false;

  constructor(private manager: SceneManager) {}

  update(dt: number, pressed: boolean): void {
    if (this.ended) return;

    // até o primeiro toque o jatinho fica flutuando
    if (!this.started) {
      this.jet.idle(dt, WORLD.height * 0.42);
      this.background.update(dt, 60);
      if (pressed) {
        this.started = true;
        this.jet.flap();
      }
      return;
    }

    if (pressed) this.jet.flap();

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
      this.finish(null);
    } else if (this.chaser.caught) {
      this.finish(this.chaser.profile.name);
    }
  }

  private checkCollisions(): void {
    const box = this.jet.hitbox;
    if (this.jet.invulnerable <= 0 && this.obstacles.some((o) => intersectsAny(box, o.hitboxes))) {
      this.jet.hit();
      this.chaser.bump(CHASER.hitThreat);
      this.flash = 0.25;
    }
    for (const o of this.obstacles) {
      if (!this.alerted.has(o) && intersectsAny(box, o.alertZones)) {
        this.alerted.add(o);
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
    const stageStarts: Record<number, string> = { 20: 'Litoral', 40: 'Oceano', 60: 'Fronteira' };
    if (stageStarts[this.score]) this.banner = { text: stageStarts[this.score], time: 1.6 };
  }

  private finish(caughtBy: string | null): void {
    this.ended = true;
    const { best, newRecord } = saveBest(this.score);
    this.manager.goToGameOver({ score: this.score, best, newRecord, caughtBy });
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
    } else if (this.banner) {
      ctx.globalAlpha = Math.min(1, this.banner.time * 2);
      outlinedText(ctx, this.banner.text, WORLD.width / 2, 150, 22, '#ffdf00');
      ctx.globalAlpha = 1;
    }
  }
}
