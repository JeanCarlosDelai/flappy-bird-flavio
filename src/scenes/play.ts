import { CHASER, JET, WORLD } from '@/core/config';
import { PAUSE_BUTTON, type FrameInput } from '@/core/input';
import { Chaser, chaserForScore } from '@/entities/chaser';
import { Jet } from '@/entities/jet';
import type { Obstacle } from '@/entities/obstacles';
import { Background } from '@/render/background';
import { drawRouteMap, routeStatus } from '@/render/map';
import { STAGES, stageIndexForScore } from '@/render/stages';
import { outlinedText, panel, plainText } from '@/render/text';
import { wrapPixelText } from '@/render/pixel-font';
import { PX } from '@/render/pixel';
import { intersectsAny } from '@/systems/collision';
import { speedFor } from '@/systems/difficulty';
import type { RunStats } from '@/systems/session';
import { Spawner } from '@/systems/spawner';
import type { Scene, SceneManager } from './scene';
import { duckMusic } from '@/audio/engine';
import { music } from '@/audio/music';
import { sfx } from '@/audio/sfx';
import { drawSoundButton, toggleSound } from '@/ui/sound-button';
import { discover, type CollectionCategory } from '@/systems/collection';

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
  private heartbeat = 0;
  /** Novidades da coleção nesta partida e fila do aviso na tela. */
  private discoveries: string[] = [];
  private newsQueue: string[] = [];
  private news: { text: string; time: number } | null = null;

  constructor(private manager: SceneManager) {
    duckMusic(false);
    music.play(STAGES[0].id);
  }

  update(dt: number, input: FrameInput): void {
    if (this.ended) return;
    if (input.sound) toggleSound();

    if (input.pause && this.started) {
      this.setPaused(!this.paused);
      return;
    }
    if (this.paused) {
      // tocar na tela também volta ao jogo
      if (input.pressed) this.setPaused(false);
      return;
    }

    // até o primeiro toque o jatinho fica flutuando
    if (!this.started) {
      this.jet.idle(dt, WORLD.height * 0.42);
      this.background.update(dt, 60);
      if (input.pressed) {
        this.started = true;
        this.found('stops', STAGES[0].id);
        this.found('chasers', `${this.chaser.profile.id}:${this.chaser.variant.id}`);
        this.jet.flap();
        sfx.flap();
      }
      return;
    }

    if (input.pressed) {
      this.jet.flap();
      sfx.flap();
    }

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

    this.spawner.update(dt, this.score, (o) => {
      this.obstacles.push(o);
      this.found('obstacles', o.kind);
    });
    this.updateNews(dt);
    for (const o of this.obstacles) o.update(dt, speed);
    this.obstacles = this.obstacles.filter((o) => !o.offscreen);

    this.checkCollisions();
    this.checkScore();

    // coração acelerado quando o perseguidor está quase pegando
    this.heartbeat -= dt;
    if (this.chaser.threat > 0.66 && this.heartbeat <= 0) {
      sfx.danger();
      this.heartbeat = 0.75;
    }

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
      sfx.hit();
      this.chaser.bump(CHASER.hitThreat);
      this.flash = 0.25;
    }
    for (const o of this.obstacles) {
      if (!this.alerted.has(o) && intersectsAny(box, o.alertZones)) {
        this.alerted.add(o);
        this.radarAlerts++;
        sfx.radar();
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
        sfx.point();
        this.onScoreChanged();
      }
    }
  }

  private onScoreChanged(): void {
    const next = chaserForScore(this.score);
    if (next !== this.chaser.profile) {
      this.chaser = new Chaser(next);
      this.found('chasers', `${next.id}:${this.chaser.variant.id}`);
      this.banner = { text: `${next.name} ${this.chaser.variant.label} na cola!`, time: 1.8 };
      sfx.chaser();
    }
    const stage = STAGES.find((s) => s.fromScore === this.score && s.fromScore > 0);
    if (stage) {
      this.found('stops', stage.id);
      this.banner = { text: stage.name, time: 1.6 };
      sfx.region();
      music.play(stage.id);
    }
  }

  /** Registra na coleção; se for a primeira vez, entra na fila do aviso. */
  private found(category: CollectionCategory, id: string): void {
    const item = discover(category, id);
    if (!item) return;
    this.discoveries.push(item.name);
    this.newsQueue.push(item.name);
  }

  private updateNews(dt: number): void {
    if (this.news) {
      this.news.time -= dt;
      if (this.news.time <= 0) this.news = null;
    }
    if (!this.news && this.newsQueue.length) {
      this.news = { text: this.newsQueue.shift()!, time: 2 };
      sfx.discover();
    }
  }

  private setPaused(paused: boolean): void {
    this.paused = paused;
    duckMusic(paused);
    sfx.pause(paused);
  }

  private finish(cause: RunStats['cause']): void {
    this.ended = true;
    duckMusic(false);
    this.manager.goToGameOver({
      score: this.score,
      durationMs: Math.round(this.elapsedMs),
      hits: this.hits,
      radarAlerts: this.radarAlerts,
      cause,
      variant: cause === 'chao' ? undefined : this.chaser.variant.id,
      hitsByObstacle: this.hitsByObstacle,
      discoveries: this.discoveries
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

    if (!this.paused) outlinedText(ctx, String(this.score), WORLD.width / 2, 84, 8);

    if (!this.started) {
      outlinedText(ctx, 'Toque para começar', WORLD.width / 2, WORLD.height * 0.62, 3);
    } else if (this.banner && !this.paused) {
      ctx.globalAlpha = Math.min(1, this.banner.time * 2);
      wrapPixelText(this.banner.text, WORLD.width - 40, 2).forEach((line, i) =>
        outlinedText(ctx, line, WORLD.width / 2, 150 + i * 18, 2, '#ffd23f')
      );
      ctx.globalAlpha = 1;
    }

    if (this.news && !this.paused) this.renderNews(ctx);
    if (this.started) this.renderPauseButton(ctx);
    if (this.paused) this.renderPause(ctx);
    drawSoundButton(ctx);
  }

  /** Aviso "NOVO NA COLEÇÃO" embaixo do placar. */
  private renderNews(ctx: CanvasRenderingContext2D): void {
    const n = this.news!;
    ctx.globalAlpha = Math.min(1, n.time * 3);
    const name = wrapPixelText(n.text, WORLD.width - 80, 2);
    const h = 30 + name.length * 16;
    panel(ctx, 196, h, 40, WORLD.width - 80);
    plainText(ctx, 'NOVO NA COLEÇÃO!', WORLD.width / 2, 214, 2, '#ffd23f');
    name.forEach((line, i) => plainText(ctx, line, WORLD.width / 2, 234 + i * 16, 2, '#ffffff'));
    ctx.globalAlpha = 1;
  }

  private renderPauseButton(ctx: CanvasRenderingContext2D): void {
    const b = PAUSE_BUTTON;
    const p = PX;
    ctx.fillStyle = '#1b1420';
    ctx.fillRect(b.x + p, b.y, b.w - 2 * p, b.h);
    ctx.fillRect(b.x, b.y + p, b.w, b.h - 2 * p);
    ctx.fillStyle = '#24406f';
    ctx.fillRect(b.x + p, b.y + p, b.w - 2 * p, b.h - 2 * p);
    ctx.fillStyle = '#33528a';
    ctx.fillRect(b.x + p, b.y + p, b.w - 2 * p, p);
    ctx.fillStyle = '#ffffff';
    if (this.paused) {
      // triângulo "play" em degraus
      for (let i = 0; i < 6; i++) ctx.fillRect(b.x + 14 + i * p, b.y + 10 + i * p, p, 20 - i * 2 * p);
    } else {
      ctx.fillRect(b.x + 12, b.y + 10, 6, 20);
      ctx.fillRect(b.x + 22, b.y + 10, 6, 20);
    }
  }

  private renderPause(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(11, 13, 30, 0.6)';
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    outlinedText(ctx, 'PAUSADO', WORLD.width / 2, 118, 6, '#ffd23f');

    panel(ctx, 156, 392, 24, WORLD.width - 48);
    outlinedText(ctx, 'Rota de fuga', WORLD.width / 2, 180, 3);
    drawRouteMap(ctx, 62, 196, 236, 236, {
      revealUpTo: stageIndexForScore(this.score),
      score: this.score
    });
    const [here, next] = routeStatus(this.score);
    plainText(ctx, here, WORLD.width / 2, 454, 2, '#ffd23f');
    plainText(ctx, next, WORLD.width / 2, 474, 2, '#ffffff');
    plainText(ctx, `${this.chaser.profile.name} na cola`, WORLD.width / 2, 500, 2, '#c9d1e3');

    outlinedText(ctx, 'Esc ou toque para continuar', WORLD.width / 2, 572, 2);
  }

}
