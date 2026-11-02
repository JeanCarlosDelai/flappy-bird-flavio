import { CHASER, JET, WORLD } from '@/core/config';
import { PAUSE_BUTTON, type FrameInput } from '@/core/input';
import { Chaser, chaserForScore } from '@/entities/chaser';
import { Jet } from '@/entities/jet';
import type { Obstacle } from '@/entities/obstacles';
import { Background } from '@/render/background';
import { drawRouteMap, routeStatus } from '@/render/map';
import { ROUTE_LENGTH, STAGES, lapForScore, scoreInStage, stageIndexForScore } from '@/render/stages';
import { outlinedText, panel, plainText } from '@/render/text';
import { wrapPixelText } from '@/render/pixel-font';
import { PX } from '@/render/pixel';
import { intersects, intersectsAny, rectGap } from '@/systems/collision';
import { speedFor } from '@/systems/difficulty';
import type { RunStats } from '@/systems/session';
import { Spawner } from '@/systems/spawner';
import { MODE_NAMES, type GameMode, type PlayOptions, type Scene, type SceneManager } from './scene';
import { rand, setSeed, todaySeed } from '@/core/random';
import { launchAttack, type Attack } from '@/entities/attacks';
import { Pickup, POWERUP_INFO, coinSprite, type PowerUpKind } from '@/entities/pickups';
import { drawSpriteAt } from '@/render/pixel';
import { STAGE_LENGTH } from '@/render/stages';
import { chaserById } from '@/entities/chaser';
import { Comment, EVENTS, EVENT_IDS, Flag, TENTS_HEIGHT, drawBlackout, drawTents, nextEventIn, spawnWave, type EventId, type Hazard } from '@/systems/events';
import { VEHICLES, VEHICLE_IDS, launchVehicle, vehicleFor } from '@/entities/vehicles';
import { BOSSES } from '@/entities/boss';
import { BossFigure } from '@/entities/boss';
import { currentSkin } from '@/entities/jet';
import { captureReplay, resetReplay } from '@/ui/replay';
import { CAPTURE_SECONDS, CRASH_SECONDS, ESCAPE_SECONDS, escapeScroll, renderCapture, renderCrash, renderEscape } from '@/entities/cutscene';
import { WEATHER, Weather, rollWeather, weatherFor } from '@/systems/weather';
import { duckMusic } from '@/audio/engine';
import { music } from '@/audio/music';
import { sfx } from '@/audio/sfx';
import { drawSoundButton, toggleSound } from '@/ui/sound-button';
import { discover, type CollectionCategory } from '@/systems/collection';
import { testMode } from '@/systems/test-mode';

const RADAR_ALERT = 0.12;
/** Quanto o perseguidor avança quando um ataque acerta. */
const ATTACK_HIT = 0.22;
/** Distância (px) para contar "passou raspando". */
const NEAR_MISS = 14;
/** Duração do chefe de cada parada (segundos). */
const BOSS_SECONDS = 9;
const BOSS_NAMES: Record<string, string> = {
  brasilia: 'Sessão extraordinária!',
  iguazu: 'Operação Fronteira!',
  guayaquil: 'Denúncia em lote!',
  miami: 'Alerta vermelho geral!'
};
const vibrate = (ms: number | number[]) => navigator.vibrate?.(ms);
/** Duração da viagem entre paradas (segundos). */
const TRAVEL_SECONDS = testMode?.travelSeconds ?? 5; // MODO TESTE pode mudar

export class PlayScene implements Scene {
  private jet = new Jet(WORLD.height * 0.42);
  private obstacles: Obstacle[] = [];
  private spawner = new Spawner();
  private background = new Background();
  private chaser = new Chaser(chaserForScore(0));
  private alerted = new WeakSet<Obstacle>();
  private score = 0;
  private flash = 0;
  private banner: { text: string; time: number } | null = null;
  private started = false;
  private paused = false;
  private ended = false;
  /** Cena final antes do fim de jogo (captura, pouso forçado ou chegada em Miami). */
  private ending: { cause: RunStats['cause']; time: number; y: number } | null = null;
  private elapsedMs = 0;
  private hits = 0;
  private radarAlerts = 0;
  private hitsByObstacle: RunStats['hitsByObstacle'] = {};
  private heartbeat = 0;
  private godMode = false;
  /** Viagem em andamento até a próxima parada. */
  private arrival: { stage: (typeof STAGES)[number]; musicSwitched: boolean } | null = null;
  /** Novidades da coleção nesta partida e fila do aviso na tela. */
  private discoveries: string[] = [];
  private newsQueue: string[] = [];
  private news: { text: string; time: number } | null = null;

  // moedas, power-ups, ataques, chefes e raspões
  private pickups: Pickup[] = [];
  private attacks: Attack[] = [];
  private attackTimer = 7;
  private runCoins = 0;
  private powerups: RunStats['powerups'] = {};
  private powerupCooldown = 12;
  private shield = false;
  private passport = 0;
  private nearMisses = 0;
  private combo = 0;
  private bestCombo = 0;
  private cleanStreak = 0;
  private bestClean = 0;
  private dangerArmed = false;
  private closeCall = false;
  private closest = new WeakMap<Obstacle, number>();
  private touched = new WeakSet<Obstacle>();
  private boss: { stage: string; time: number; attackTimer: number; figure: BossFigure; hits: number } | null = null;
  private bossesDone = new Set<string>();
  private bossesBeaten: string[] = [];
  private floaters: { text: string; x: number; y: number; time: number; color: string }[] = [];
  private readonly daily: boolean;
  private mode: GameMode;
  private readonly seed: number;
  private readonly challenge: PlayOptions['challenge'];

  // EVENTOS ALEATÓRIOS (no Modo teste seguem a configuração de lá)
  private readonly eventsOn = testMode ? testMode.events : true;
  private eventTimer = testMode ? testMode.eventInterval : nextEventIn(true);
  private event: { id: EventId; phase: 'aviso' | 'ativo'; time: number; spawn: number; hits: number; coins: number } | null = null;
  private eventsClean: string[] = [];
  // CLIMA da parada: segundos até o tempo fechar (null = não vai fechar nesta parada)
  private weatherIn: number | null = rollWeather(!!testMode?.weather);
  private weather: Weather | null = null;
  private passedByObstacle: Record<string, number> = {};
  private pauses = 0;
  private readonly startHour = new Date().getHours();
  private bossesClean: string[] = [];
  private chasersSeen = new Set<string>();
  private rainCoins = 0;
  private falling: Hazard[] = [];
  /** Altura atual das barracas da ocupação (0 = sem barracas) e deslocamento delas. */
  private tents = 0;
  private tentsOffset = 0;

  constructor(private manager: SceneManager, options: PlayOptions = {}) {
    this.daily = !!options.daily;
    this.mode = this.daily ? 'normal' : options.mode ?? 'normal';
    // toda partida tem semente: Desafio do dia (igual para todos), desafio de amigo (a do link) ou sorteada
    this.challenge = this.daily ? undefined : options.challenge;
    if (this.challenge) this.mode = 'normal';
    this.seed = this.daily ? todaySeed() : this.challenge?.seed ?? ((Math.random() * 2 ** 31) >>> 0) + 1;
    setSeed(this.seed);
    resetReplay();
    this.mountTestButton(); // MODO TESTE
    // MODO TESTE: parada inicial e invencível
    if (testMode) {
      this.score = STAGES[testMode.startStage].fromScore;
      this.godMode = testMode.invincible;
    }
    // atalho de teste (só em desenvolvimento): /jogar.html?pontos=38 começa com 38 pontos
    if (import.meta.env.DEV) {
      const params = new URLSearchParams(location.search);
      const start = Number(params.get('pontos'));
      if (start > 0) this.score = start;
      if (params.has('deus')) this.godMode = true; // ?deus: não bate nem cai (para testar)
      Object.assign(window, { __travel: () => this.background.travelProgress, __score: () => this.score, __rain: () => this.rainCoins, __clean: () => this.eventsClean, __banner: () => this.banner, __floaters: () => this.floaters });
    }
    duckMusic(false);
    music.play(STAGES[stageIndexForScore(this.score)].id);
    this.chaser = new Chaser(chaserForScore(this.score));
    this.banner = { text: STAGES[stageIndexForScore(this.score)].name, time: 1.6 };
    if (this.daily) this.banner = { text: 'Desafio do dia', time: 2.2 };
    else if (this.challenge) this.banner = { text: `Desafio de ${this.challenge.from}: faça mais de ${this.challenge.target}`, time: 2.8 };
    else if (this.mode === 'semfim') this.banner = { text: 'Modo sem fim: a rota não acaba', time: 2.4 };
    else if (this.mode === 'hardcore') this.banner = { text: 'Hardcore: uma batida e acabou', time: 2.4 };
  }

  update(dt: number, input: FrameInput): void {
    if (this.ended) return;
    if (input.sound) toggleSound();
    if (this.ending) {
      this.updateEnding(dt, input.pressed);
      return;
    }

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
        this.found('stops', STAGES[stageIndexForScore(this.score)].id);
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
    this.updateWeather(dt);
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
      this.spawnPickups(o, speed);
    });
    this.updateNews(dt);
    this.updateArrival();
    for (const o of this.obstacles) o.update(dt, speed);
    this.obstacles = this.obstacles.filter((o) => !o.offscreen);
    for (const p of this.pickups) p.update(dt, speed);
    this.pickups = this.pickups.filter((p) => !p.offscreen && !p.taken);
    this.updateAttacks(dt);
    this.updateBoss(dt);
    this.updateEvent(dt, speed);
    this.passport = Math.max(0, this.passport - dt);
    this.powerupCooldown -= dt;
    for (const f of this.floaters) {
      f.time -= dt;
      f.y -= 30 * dt;
    }
    this.floaters = this.floaters.filter((f) => f.time > 0);

    this.checkCollisions();
    this.checkPickups();
    this.trackNearMisses();
    this.checkScore();

    // escapou com o perigo no vermelho?
    if (this.chaser.threat > 0.9) this.dangerArmed = true;
    if (this.dangerArmed && this.chaser.threat < 0.3) this.closeCall = true;

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
    if (this.godMode && this.jet.y + JET.height / 2 >= WORLD.height - WORLD.groundHeight) {
      this.jet.y = WORLD.height - WORLD.groundHeight - JET.height;
      this.jet.vy = 0;
    } else if (this.jet.y + JET.height / 2 >= WORLD.height - WORLD.groundHeight) {
      this.finish('chao');
    } else if (this.chaser.caught) {
      this.finish(this.chaser.profile.id);
    }
  }

  /** Batida: o escudo absorve; senão o perseguidor avança. */
  private takeHit(threat: number): void {
    this.combo = 0;
    this.cleanStreak = 0;
    if (this.shield) {
      this.shield = false;
      this.jet.hit();
      sfx.shield();
      vibrate(30);
      this.float('ESCUDO!', '#7bd389');
      return;
    }
    this.hits++;
    this.jet.hit();
    sfx.hit();
    vibrate(80);
    this.chaser.bump(this.mode === 'hardcore' ? 1 : threat);
    this.flash = 0.25;
  }

  private checkCollisions(): void {
    if (this.godMode) return;
    const box = this.jet.hitbox;
    const ghost = this.passport > 0;
    const hitBy = this.jet.invulnerable <= 0 && !ghost ? this.obstacles.find((o) => intersectsAny(box, o.hitboxes)) : undefined;
    if (hitBy) {
      this.touched.add(hitBy);
      this.hitsByObstacle[hitBy.kind] = (this.hitsByObstacle[hitBy.kind] ?? 0) + 1;
      this.takeHit(CHASER.hitThreat);
    }
    if (this.jet.invulnerable <= 0 && !ghost && this.attacks.some((a) => intersectsAny(box, a.hitboxes))) {
      this.takeHit(ATTACK_HIT);
    }
    const tentsTop = WORLD.height - WORLD.groundHeight - this.tents + 10;
    if (this.jet.invulnerable <= 0 && !ghost && this.tents > 0 && box.y + box.h > tentsTop) {
      this.takeHit(ATTACK_HIT);
    }
    if (this.jet.invulnerable <= 0 && !ghost && this.falling.some((f) => f.hitbox && intersects(box, f.hitbox))) {
      this.takeHit(ATTACK_HIT);
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
        this.passedByObstacle[o.kind] = (this.passedByObstacle[o.kind] ?? 0) + 1;
        this.score++;
        this.cleanStreak++;
        this.bestClean = Math.max(this.bestClean, this.cleanStreak);
        sfx.point();
        this.checkNearMiss(o);
        this.onScoreChanged();
      }
    }
  }

  private onScoreChanged(): void {
    if (this.score >= ROUTE_LENGTH && this.mode !== 'semfim') {
      this.finish('fuga');
      return;
    }
    // chegou ao fim de uma parada (no sem fim, depois de Miami volta para Brasília)
    const stage = this.score > 0 && scoreInStage(this.score) === 0 ? STAGES[stageIndexForScore(this.score)] : undefined;
    if (stage) {
      if (stage.id === 'brasilia') {
        this.bossesDone.clear(); // nova volta: os chefes voltam
        this.float(`VOLTA ${lapForScore(this.score)}!`, '#ffd23f');
      }
      // viagem até a próxima parada: sem obstáculos novos, câmera passa pelo trecho de viagem
      this.background.travelTo(stage.id, TRAVEL_SECONDS);
      this.spawner.hold(TRAVEL_SECONDS + 0.4);
      this.arrival = { stage, musicSwitched: false };
      this.banner = { text: `Chegando em ${stage.name}...`, time: 2.2 };
    } else if (!this.background.traveling) {
      this.syncChaser();
      this.maybeStartBoss();
    }
  }

  // ---------- clima ----------

  private updateWeather(dt: number): void {
    if (this.weatherIn !== null && !this.background.traveling && this.started) {
      this.weatherIn -= dt;
      if (this.weatherIn <= 0) {
        this.weatherIn = null;
        const id = weatherFor(STAGES[stageIndexForScore(this.score)].id);
        this.weather = new Weather(id);
        this.float(WEATHER[id].name.toUpperCase(), '#cfe8ff');
        this.found('weather', id);
      }
    }
    if (!this.weather) {
      this.jet.weight = 1;
      return;
    }
    this.weather.update(dt);
    this.jet.weight = this.weather.weight;
    if (this.passport <= 0 && !this.godMode) this.jet.vy += this.weather.wind * dt;
    if (this.weather.done) this.weather = null;
  }

  // ---------- chefes ----------

  /** Perto do fim de cada parada, o grupo dela ataca junto por alguns segundos. */
  /** Começa um evento (sorteado se `id` não vier). */
  private startEvent(id: EventId = EVENT_IDS[Math.floor(rand() * EVENT_IDS.length)]): void {
    this.jet.gravitySign = 1;
    this.event = { id, phase: 'aviso', time: 0, spawn: 0, hits: this.hits, coins: 0 };
    this.banner = { text: `! ${EVENTS[id].warning.replace(/!$/, '')} !`, time: 2 };
    sfx.boss(true);
    this.found('events', id);
  }

  /** Começa o chefe da parada atual. */
  private startBoss(): void {
    const stage = STAGES[stageIndexForScore(this.score)];
    this.bossesDone.add(stage.id);
    this.boss = { stage: stage.id, time: 0, attackTimer: 1.2, figure: new BossFigure(stage.id, BOSS_SECONDS), hits: this.hits };
    this.spawner.hold(BOSS_SECONDS + 0.5);
    this.banner = { text: `CHEFE: ${BOSS_NAMES[stage.id]}`, time: 2.4 };
    this.found('bosses', stage.id);
    sfx.boss(true);
    vibrate([40, 60, 40]);
  }

  // ---------- MODO TESTE: botão na tela para disparar clima, eventos, veículos e chefe ----------

  private testButton: HTMLButtonElement | null = null;

  private mountTestButton(): void {
    if (!testMode || this.testButton) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'test-fab';
    b.textContent = '🧪 Teste';
    b.addEventListener('click', () => this.openTestPanel());
    document.body.append(b);
    this.testButton = b;
  }

  private removeTestUi(): void {
    this.testButton?.remove();
    this.testButton = null;
    document.querySelector('.test-panel')?.remove();
  }

  private openTestPanel(): void {
    if (this.ending || document.querySelector('.test-panel')) return;
    if (!this.started) {
      this.started = true;
      this.found('stops', STAGES[stageIndexForScore(this.score)].id);
    }
    this.setPaused(true);
    const overlay = document.createElement('div');
    overlay.className = 'go-overlay menu-sheet test-panel';
    const card = document.createElement('section');
    card.className = 'go-card';
    card.innerHTML = '<h2 class="go-title">🧪 Disparar agora</h2>';
    const close = () => {
      overlay.remove();
      this.setPaused(false);
    };
    const grid = document.createElement('div');
    grid.className = 'test-grid';
    const add = (label: string, run: () => void) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'test-btn';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        run();
        close();
      });
      grid.append(btn);
    };
    const region = STAGES[stageIndexForScore(this.score)].id;
    add(`🌧️ Clima: ${WEATHER[weatherFor(region)].name}`, () => {
      this.weatherIn = 0.01;
      this.weather = null;
    });
    add('🎲 Evento aleatório', () => this.startEvent());
    for (const id of EVENT_IDS) add(`⚡ ${EVENTS[id].name}`, () => this.startEvent(id));
    const vehicle = vehicleFor(this.chaser.profile.id);
    add(vehicle ? `🛩️ Veículo: ${VEHICLES[vehicle].name}` : '🛩️ Veículo (sorteado)', () => {
      const id = vehicle ?? VEHICLE_IDS[Math.floor(rand() * VEHICLE_IDS.length)];
      this.attacks.push(launchVehicle(id));
      this.found('vehicles', id);
    });
    add(`👑 Chefe: ${BOSSES[region].name}`, () => {
      this.event = null;
      this.jet.gravitySign = 1;
      this.startBoss();
    });
    add(`🎯 Ataque de ${this.chaser.profile.name}`, () => this.fireAttack(this.chaser.profile.id));
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'go-btn go-btn-secondary sheet-close';
    back.textContent = 'Fechar';
    back.addEventListener('click', close);
    overlay.addEventListener('click', (e) => e.target === overlay && close());
    card.append(grid, back);
    overlay.append(card);
    document.body.append(overlay);
  }

  private maybeStartBoss(): void {
    // durante um evento o chefe espera (tenta de novo no próximo ponto)
    if (STAGE_LENGTH < 8 || this.boss || this.event) return;
    const stage = STAGES[stageIndexForScore(this.score)];
    if (this.bossesDone.has(stage.id) || scoreInStage(this.score) < STAGE_LENGTH - 3) return;
    this.startBoss();
  }

  private updateBoss(dt: number): void {
    if (!this.boss) return;
    this.boss.time += dt;
    this.boss.figure.update(dt);
    this.boss.attackTimer -= dt;
    if (this.boss.attackTimer <= 0 && this.boss.time < BOSS_SECONDS - 1.5) {
      this.boss.attackTimer = 0.8;
      // o chefe gigante ataca da direita; às vezes o grupo da parada ajuda pela esquerda
      if (rand() < 0.6) {
        this.attacks.push(...this.boss.figure.attack(this.jet.y));
        sfx.attack();
        return;
      }
      const roster = STAGES.find((st) => st.id === this.boss!.stage)!.chasers;
      const allowed = testMode?.chasers.length ? roster.filter((c) => testMode!.chasers.includes(c)) : roster;
      const who = (allowed.length ? allowed : roster)[Math.floor(rand() * (allowed.length || roster.length))];
      // no chefe os ataques saem de alturas variadas (não só de onde está o jatinho)
      this.fireAttack(chaserById(who).id, 110 + rand() * 360);
    }
    if (this.boss.time >= BOSS_SECONDS) {
      this.bossesBeaten.push(this.boss.stage);
      if (this.hits === this.boss.hits) this.bossesClean.push(this.boss.stage);
      this.boss = null;
      this.addCoins(10, 'CHEFE VENCIDO!');
      sfx.boss(false);
    }
  }

  // ---------- eventos aleatórios (prévia) ----------

  private updateEvent(dt: number, speed: number): void {
    for (const f of this.falling) f.update(dt, speed);
    this.falling = this.falling.filter((f) => !f.done);
    // barracas da ocupação: sobem durante o evento e descem quando acaba
    const tentsUp = this.event?.id === 'ocupacao' && this.event.phase === 'ativo' && this.event.time < EVENTS.ocupacao.seconds - 0.6;
    this.tents = Math.max(0, Math.min(TENTS_HEIGHT, this.tents + (tentsUp ? 1 : -1) * TENTS_HEIGHT * 2 * dt));
    this.tentsOffset += speed * dt;
    if (!this.eventsOn && !this.event) return;

    if (!this.event) {
      if (this.background.traveling || this.boss) return;
      this.eventTimer -= dt;
      if (this.eventTimer > 0) return;
      const forced = testMode?.event;
      this.startEvent(forced && (EVENT_IDS as string[]).includes(forced) ? (forced as EventId) : undefined);
      return;
    }

    const e = this.event;
    e.time += dt;
    if (e.phase === 'aviso') {
      if (e.time >= 2) {
        e.phase = 'ativo';
        e.time = 0;
        if (e.id === 'gravidade') this.jet.gravitySign = -1;
      }
      return;
    }

    e.spawn -= dt;
    if ((e.id === 'fraldas' || e.id === 'constituicao') && e.spawn <= 0) {
      e.spawn = e.id === 'fraldas' ? 1.6 : 1.1; // fraldas: ondas mais espaçadas
      this.falling.push(...spawnWave(e.id));
    }
    if (e.id === 'greve') {
      // rajadas de vento: empurram para cima e para baixo
      if (this.passport <= 0 && !this.godMode) this.jet.vy += Math.sin(e.time * 2.2) * 420 * dt;
      if (e.spawn <= 0) {
        e.spawn = 0.9;
        this.falling.push(new Flag());
      }
    }
    if (e.id === 'live' && e.spawn <= 0) {
      e.spawn = 0.35;
      this.falling.push(new Comment());
    }
    if (e.id === 'moedas' && e.spawn <= 0) {
      e.spawn = 0.18;
      const coin = new Pickup(140 + rand() * 230, -20, 'coin');
      coin.fall = 170 + rand() * 80;
      this.pickups.push(coin);
    }
    if (e.time >= EVENTS[e.id].seconds) {
      this.jet.gravitySign = 1;
      this.event = null;
      // para as medalhas dos eventos
      if (this.hits === e.hits && !this.eventsClean.includes(e.id)) this.eventsClean.push(e.id);
      if (e.id === 'moedas') this.rainCoins = Math.max(this.rainCoins, e.coins);
      this.eventTimer = testMode ? testMode.eventInterval : nextEventIn();
      this.attackTimer = 2.5 + rand() * 2; // os perseguidores voltam a atacar pouco depois
      this.float(`${EVENTS[e.id].name.toUpperCase()} PASSOU`, '#7bd389');
    }
  }

  // ---------- ataques ----------

  private fireAttack(id: Parameters<typeof launchAttack>[0], fromY?: number): void {
    const [x, y] = this.chaser.position(this.jet.y);
    this.attacks.push(...launchAttack(id, Math.max(x, -10), fromY ?? y, this.jet.y));
    sfx.attack();
  }

  private updateAttacks(dt: number): void {
    // durante um evento os perseguidores não atacam (para não ficar difícil demais)
    if (!this.background.traveling && !this.boss && !this.event) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.attackTimer = Math.max(4.5, 9 - this.score * 0.02) + rand() * 3;
        // às vezes o perseguidor chama o veículo do partido no lugar do ataque normal
        const vehicle = vehicleFor(this.chaser.profile.id);
        const chance = testMode?.vehicles ? 1 : 0.3;
        if (vehicle && rand() < chance) {
          this.attacks.push(launchVehicle(vehicle));
          this.found('vehicles', vehicle);
          this.attackTimer += 3;
          sfx.boss(true);
        } else {
          this.fireAttack(this.chaser.profile.id);
        }
      }
    }
    for (const a of this.attacks) {
      a.update(dt, this.jet.y);
      const push = a.push(this.jet.y);
      if (push && this.passport <= 0 && !this.godMode) this.jet.vy += push * dt;
    }
    this.attacks = this.attacks.filter((a) => !a.done);
  }

  // ---------- moedas e power-ups ----------

  /** Altura da última passagem segura (para ligar uma passagem à outra com moedas). */
  private lastSafeY = WORLD.height * 0.42;

  /**
   * Moedas e power-ups no caminho do avião: dentro da passagem do obstáculo (presos a ela,
   * acompanhando se ela se mexer) e numa trilha ligando a passagem anterior a esta.
   * Nada fica em cima de uma parte do obstáculo.
   */
  private spawnPickups(o: Obstacle, speed: number): void {
    const safe = Math.max(70, Math.min(WORLD.height - WORLD.groundHeight - 60, o.safeY));
    const fromY = this.lastSafeY;
    this.lastSafeY = safe;
    const r = rand();

    if (r < 0.14 && this.powerupCooldown <= 0) {
      const kinds: PowerUpKind[] = this.mode === 'hardcore' ? ['passaporte', 'combustivel'] : ['escudo', 'passaporte', 'combustivel'];
      const kind = kinds[Math.floor(rand() * kinds.length)];
      this.pickups.push(new Pickup(0, 0, kind, { obstacle: o, dx: o.width / 2 - 20, dy: 0 }));
      this.powerupCooldown = 16;
      return;
    }
    if (r > 0.75) return;

    // 3 moedas dentro da passagem
    for (let i = -1; i <= 1; i++) {
      this.pickups.push(new Pickup(0, 0, 'coin', { obstacle: o, dx: o.width / 2 - 12 + i * 30, dy: 0 }));
    }
    // trilha de 2 moedas entre a passagem anterior e esta (antes do obstáculo)
    if (rand() < 0.6) {
      const room = Math.min(220, this.spawner.timeToNext * speed);
      for (const t of [0.35, 0.7]) {
        const x = o.x - room * (1 - t) - 12;
        const y = fromY + (safe - fromY) * t - 12;
        const coin = new Pickup(x, y, 'coin');
        const clear = this.obstacles.every((ob) => ob.hitboxes.every((h) => rectGap(coin.hitbox, h) > 8));
        if (clear && x > JET.x + 40) this.pickups.push(coin);
      }
    }
  }

  private checkPickups(): void {
    const box = this.jet.hitbox;
    for (const p of this.pickups) {
      if (p.taken || !intersects(box, p.hitbox)) continue;
      p.taken = true;
      if (p.kind === 'coin') {
        this.addCoins(1);
        if (this.event?.id === 'moedas') this.event.coins++;
        continue;
      }
      this.powerups![p.kind] = (this.powerups![p.kind] ?? 0) + 1;
      sfx.powerUp();
      vibrate(25);
      this.float(POWERUP_INFO[p.kind].name.toUpperCase() + '!', '#7ef2ff');
      if (p.kind === 'escudo') this.shield = true;
      else if (p.kind === 'passaporte') this.passport = 5;
      else this.chaser.threat = Math.max(0, this.chaser.threat - 0.5);
    }
  }

  private addCoins(n: number, label?: string): void {
    this.runCoins += n;
    sfx.coin();
    if (label) this.float(`${label} +${n}`, '#ffd23f');
  }

  private float(text: string, color: string): void {
    this.floaters.push({ text, x: WORLD.width / 2, y: 250, time: 1.2, color });
  }

  // ---------- passou raspando ----------

  /** Guarda a menor distância entre o jatinho e cada obstáculo enquanto passam um pelo outro. */
  private trackNearMisses(): void {
    if (this.passport > 0) return;
    const box = this.jet.hitbox;
    for (const o of this.obstacles) {
      if (o.passed || o.x > box.x + box.w + 4 || o.x + o.width < box.x - 4) continue;
      const gap = Math.min(...o.hitboxes.map((h) => rectGap(box, h)));
      this.closest.set(o, Math.min(this.closest.get(o) ?? Infinity, gap));
    }
  }

  private checkNearMiss(o: Obstacle): void {
    const gap = this.closest.get(o);
    if (gap === undefined || gap > NEAR_MISS || this.touched.has(o)) return;
    this.nearMisses++;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    sfx.nearMiss();
    vibrate(12);
    this.addCoins(1 + Math.floor(this.combo / 3), this.combo > 1 ? `RASPANDO! x${this.combo}` : 'RASPANDO!');
  }

  /** Troca o perseguidor quando chega a vez do próximo do grupo da parada. */
  private syncChaser(): void {
    const next = chaserForScore(this.score);
    if (next === this.chaser.profile) return;
    const threat = this.chaser.threat;
    this.chaser = new Chaser(next);
    this.chaser.threat = Math.min(0.5, threat); // quem chega herda parte da perseguição
    this.found('chasers', `${next.id}:${this.chaser.variant.id}`);
    this.banner = { text: `${next.name} ${this.chaser.variant.label} na cola!`, time: 1.8 };
    sfx.chaser();
  }

  /** Acompanha a viagem: música troca no meio, chegada no fim. */
  private updateArrival(): void {
    if (!this.arrival) return;
    const progress = this.background.travelProgress;
    if (!this.arrival.musicSwitched && progress >= 0.45) {
      this.arrival.musicSwitched = true;
      music.play(this.arrival.stage.id);
    }
    if (!this.background.traveling) {
      const { stage } = this.arrival;
      this.arrival = null;
      this.weather = null;
      this.weatherIn = rollWeather(!!testMode?.weather);
      this.found('stops', stage.id);
      this.banner = { text: `${stage.name} (${stage.country})`, time: 1.8 };
      sfx.region();
      this.syncChaser();
    }
  }

  /** Registra na coleção; se for a primeira vez, entra na fila do aviso. */
  private found(category: CollectionCategory, id: string): void {
    if (category === 'chasers') this.chasersSeen.add(id);
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
    if (paused && !this.paused) this.pauses++;
    this.paused = paused;
    duckMusic(paused);
    sfx.pause(paused);
  }

  /** Começa a cena final; o fim de jogo vem quando ela acaba (ou com um toque, depois de 1 s). */
  private finish(cause: RunStats['cause']): void {
    if (this.ending) return;
    this.ending = { cause, time: 0, y: this.jet.y };
    this.attacks = [];
    this.falling = [];
    this.boss = null;
    this.weather = null;
    if (cause === 'fuga') {
      this.obstacles = this.obstacles.filter((o) => o.x > JET.x + 40);
      this.pickups = [];
      sfx.region();
    } else if (cause !== 'chao') {
      this.chaser.bump(1);
    }
  }

  private updateEnding(dt: number, pressed: boolean): void {
    const e = this.ending!;
    e.time += dt;
    const speed = speedFor(this.score);
    const length = e.cause === 'fuga' ? ESCAPE_SECONDS : e.cause === 'chao' ? CRASH_SECONDS : CAPTURE_SECONDS;
    if (e.cause === 'fuga') {
      const scroll = escapeScroll(e.time, speed);
      this.background.update(dt, scroll);
      for (const o of this.obstacles) o.update(dt, Math.max(scroll, speed * 0.6));
    } else if (e.cause !== 'chao') {
      this.chaser.update(dt);
      this.jet.y = e.y + Math.sin(e.time * 40) * 2 * Math.max(0, 1 - e.time);
    }
    for (const f of this.floaters) f.time -= dt;
    // pular: no final de Miami só depois do "FUGA CONCLUÍDA!"; nos outros, depois de 1,2 s
    const skipAfter = e.cause === 'fuga' ? 6.6 : 1.2;
    if (e.time >= length || (pressed && e.time > skipAfter)) this.finishNow(e.cause);
  }

  private finishNow(cause: RunStats['cause']): void {
    this.ended = true;
    this.removeTestUi();
    if (cause !== 'fuga') vibrate([120, 60, 200]);
    duckMusic(false);
    this.manager.goToGameOver({
      score: this.score,
      durationMs: Math.round(this.elapsedMs),
      hits: this.hits,
      radarAlerts: this.radarAlerts,
      cause,
      variant: cause === 'chao' ? undefined : this.chaser.variant.id,
      hitsByObstacle: this.hitsByObstacle,
      discoveries: this.discoveries,
      coins: this.runCoins,
      nearMisses: this.nearMisses,
      bestCombo: this.bestCombo,
      bosses: this.bossesBeaten,
      powerups: this.powerups,
      cleanStreak: Math.max(this.bestClean, this.cleanStreak),
      closeCall: this.closeCall,
      daily: this.daily,
      mode: this.mode,
      eventsClean: this.eventsClean,
      passedByObstacle: this.passedByObstacle,
      chasersSeen: [...this.chasersSeen],
      pauses: this.pauses,
      bossesClean: this.bossesClean,
      startHour: this.startHour,
      skin: currentSkin(),
      seed: this.seed,
      challenge: this.challenge,
      rainCoins: this.rainCoins
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.background.render(ctx, this.mode === 'semfim' ? this.score : Math.min(this.score, ROUTE_LENGTH - 1));
    for (const o of this.obstacles) o.render(ctx);
    drawTents(ctx, this.tents, this.tentsOffset);
    for (const p of this.pickups) p.render(ctx);
    for (const a of this.attacks) if (!a.front) a.render(ctx);
    this.boss?.figure.render(ctx);
    if (this.passport > 0) ctx.globalAlpha = 0.45 + 0.2 * Math.sin(this.passport * 20);
    if (this.ending?.cause !== 'fuga') this.jet.render(ctx);
    ctx.globalAlpha = 1;
    if (this.shield) this.renderShield(ctx);
    if (this.started && this.ending?.cause !== 'fuga') this.chaser.render(ctx, this.jet.y);
    for (const a of this.attacks) if (a.front) a.render(ctx);
    for (const f of this.falling) f.render(ctx);
    this.weather?.render(ctx);
    if (this.event?.id === 'live' && this.event.phase === 'ativo' && Math.floor(this.event.time * 2) % 2 === 0) {
      ctx.fillStyle = '#ff3b3b';
      ctx.fillRect(WORLD.width - 116, 104, 10, 10);
      plainText(ctx, 'AO VIVO', WORLD.width - 70, 110, 2, '#ff3b3b');
    }
    if (this.event?.id === 'apagao' && this.event.phase === 'ativo') {
      const t = this.event.time;
      const fade = Math.min(1, t * 2, (EVENTS.apagao.seconds - t) * 2);
      drawBlackout(ctx, JET.x, this.jet.y, fade);
    }
    if (this.event?.id === 'gravidade' && this.event.phase === 'ativo' && !this.paused) {
      plainText(ctx, 'GRAVIDADE INVERTIDA: TOQUE PARA DESCER', WORLD.width / 2, 196, 1.5, '#ff9ad5');
    }

    if (this.ending) {
      const e = this.ending;
      if (e.cause === 'fuga') renderEscape(ctx, e.time, e.y, Math.floor(e.time * 12) % 2);
      else if (e.cause === 'chao') renderCrash(ctx, e.time, this.jet.y);
      else renderCapture(ctx, e.time, this.jet.y, this.chaser.profile.name);
      drawSoundButton(ctx);
      captureReplay(ctx.canvas);
      return;
    }

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

    if (this.started && !this.paused) this.renderHud(ctx);
    if (this.boss && !this.paused) this.boss.figure.renderBar(ctx);
    if (testMode && !this.paused && !this.boss) plainText(ctx, 'MODO TESTE', WORLD.width / 2, 132, 2, '#ff9ad5'); // MODO TESTE
    if (this.challenge && this.started && !this.paused) {
      const beat = this.score > this.challenge.target;
      plainText(ctx, beat ? `DESAFIO BATIDO! (${this.challenge.target})` : `ALVO: ${this.challenge.target + 1}`, WORLD.width / 2, 146, 1.5, beat ? '#7bd389' : '#ffd23f');
    }
    if (this.mode !== 'normal' && this.started && !this.paused) {
      const label = this.mode === 'hardcore' ? 'HARDCORE' : `SEM FIM · VOLTA ${lapForScore(this.score)}`;
      plainText(ctx, label, WORLD.width / 2, 146, 1.5, this.mode === 'hardcore' ? '#ff5a5a' : '#7ef2ff');
    }
    if (this.news && !this.paused) this.renderNews(ctx);
    if (this.started) this.renderPauseButton(ctx);
    if (this.paused) this.renderPause(ctx);
    drawSoundButton(ctx);
    if (this.started && !this.paused) captureReplay(ctx.canvas);
  }

  /** Aviso pequeno no canto de baixo: só um "✓ novo na coleção". */
  private renderNews(ctx: CanvasRenderingContext2D): void {
    const n = this.news!;
    ctx.globalAlpha = Math.min(1, n.time * 3);
    const x = 8;
    const y = WORLD.height - WORLD.groundHeight - 34;
    ctx.fillStyle = '#1b1420';
    ctx.fillRect(x, y, 148, 24);
    ctx.fillStyle = '#13294f';
    ctx.fillRect(x + 2, y + 2, 144, 20);
    ctx.fillStyle = '#7bd389';
    // "check" em pixels
    for (const [cx, cy] of [[0, 4], [2, 6], [4, 8], [6, 6], [8, 4], [10, 2], [12, 0]]) ctx.fillRect(x + 8 + cx, y + 6 + cy, 2, 2);
    plainText(ctx, 'NOVO NA COLEÇÃO', x + 86, y + 12, 1.5, '#ffffff');
    ctx.globalAlpha = 1;
  }

  /** Moedas da partida, escudo/passaporte ativos e textos que sobem. */
  private renderHud(ctx: CanvasRenderingContext2D): void {
    drawSpriteAt(ctx, coinSprite(0), 10, 44, PX);
    plainText(ctx, String(this.runCoins), 52, 58, 2, '#ffd23f');
    if (this.passport > 0) {
      plainText(ctx, 'PASSAPORTE', 290, 66, 1.5, '#7ef2ff');
      ctx.fillStyle = '#7ef2ff';
      ctx.fillRect(254, 74, (this.passport / 5) * 72, 4);
    }
    if (this.combo > 1) plainText(ctx, `COMBO x${this.combo}`, WORLD.width / 2, 116, 2, '#ff9ad5');
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.time * 2);
      outlinedText(ctx, f.text, f.x, f.y, 2, f.color);
    }
    ctx.globalAlpha = 1;
  }

  /** Bolha do habeas corpus em volta do jatinho. */
  private renderShield(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(123, 211, 137, 0.85)';
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2;
      ctx.fillRect(Math.round(JET.x + Math.cos(a) * 34), Math.round(this.jet.y + Math.sin(a) * 26), PX, PX);
    }
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
      revealUpTo: this.score >= ROUTE_LENGTH ? STAGES.length - 1 : stageIndexForScore(this.score),
      score: this.score % ROUTE_LENGTH
    });
    if (this.mode !== 'normal') plainText(ctx, `${MODE_NAMES[this.mode]}${this.mode === 'semfim' ? ` · volta ${lapForScore(this.score)}` : ''}`, WORLD.width / 2, 524, 2, '#ff9ad5');
    const [here, next] = routeStatus(this.score);
    plainText(ctx, here, WORLD.width / 2, 454, 2, '#ffd23f');
    plainText(ctx, next, WORLD.width / 2, 474, 2, '#ffffff');
    plainText(ctx, `${this.chaser.profile.name} na cola`, WORLD.width / 2, 500, 2, '#c9d1e3');

    outlinedText(ctx, 'Esc ou toque para continuar', WORLD.width / 2, 572, 2);
  }

}
