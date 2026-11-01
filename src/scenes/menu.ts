import { WORLD } from '@/core/config';
import { Jet } from '@/entities/jet';
import { Background } from '@/render/background';
import { outlinedText, panel, plainText } from '@/render/text';
import { loadHistory } from '@/systems/session';
import type { FrameInput } from '@/core/input';
import { music } from '@/audio/music';
import { progress } from '@/systems/collection';
import { loadProgress } from '@/systems/progress';
import { testMode } from '@/systems/test-mode';
import { missionStatus } from '@/systems/missions';
import { canOfferInstall, install, onInstallAvailabilityChange } from '@/pwa';
import { drawSoundButton, toggleSound } from '@/ui/sound-button';
import { challengeFromUrl, type Scene, type SceneManager } from './scene';

/** Janela com as missões do dia. */
function showMissions(): void {
  const overlay = document.createElement('div');
  overlay.className = 'go-overlay missions-overlay';
  const card = document.createElement('section');
  card.className = 'go-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Missões do dia');
  const title = document.createElement('h2');
  title.className = 'go-title';
  title.textContent = '🎯 Missões do dia';
  const note = document.createElement('p');
  note.className = 'go-note';
  note.textContent = 'Valem para todas as partidas de hoje (somam). Mudam à meia-noite (horário de Brasília).';
  const list = document.createElement('ul');
  list.className = 'missions-list';
  for (const { mission, value, done } of missionStatus()) {
    const li = document.createElement('li');
    if (done) li.className = 'done';
    const text = document.createElement('span');
    text.textContent = `${done ? '✅' : '▫️'} ${mission.text}`;
    const info = document.createElement('b');
    info.textContent = `${value}/${mission.target} · 🪙${mission.reward}`;
    const bar = document.createElement('i');
    bar.style.width = `${Math.round((value / mission.target) * 100)}%`;
    li.append(text, info, bar);
    list.append(li);
  }
  const close = document.createElement('button');
  close.className = 'go-btn';
  close.type = 'button';
  close.textContent = 'Fechar';
  const dismiss = () => overlay.remove();
  close.addEventListener('click', dismiss);
  overlay.addEventListener('click', (e) => e.target === overlay && dismiss());
  card.append(title, note, list, close);
  overlay.append(card);
  document.body.append(overlay);
  close.focus();
}

export class MenuScene implements Scene {
  private jet = new Jet(WORLD.height * 0.42);
  private background = new Background();
  private time = 0;
  private best = loadHistory().best;

  private link: HTMLDivElement;
  /** Desafio vindo de um link de amigo. */
  private challenge = challengeFromUrl();

  constructor(private manager: SceneManager) {
    // links fixos embaixo: ranking e coleção
    this.link = document.createElement('div');
    this.link.className = 'menu-links';
    const all = progress().all;
    // Desafio do dia: começa a partida com a sequência do dia
    const daily = document.createElement('a');
    daily.className = 'menu-link menu-daily';
    daily.href = '#desafio';
    daily.textContent = '📅 Desafio do dia';
    daily.addEventListener('click', (e) => {
      e.preventDefault();
      this.link.remove();
      this.manager.goToPlay({ daily: true });
    });
    this.link.append(daily);
    // modos: sem fim e hardcore
    for (const [mode, text] of [['semfim', '♾️ Sem fim'], ['hardcore', '💀 Hardcore']] as const) {
      const a = document.createElement('a');
      a.className = 'menu-link menu-mode';
      a.href = `#${mode}`;
      a.textContent = text;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.link.remove();
        this.manager.goToPlay({ mode });
      });
      this.link.append(a);
    }
    // missões do dia
    const status = missionStatus();
    const missions = document.createElement('a');
    missions.className = 'menu-link';
    missions.href = '#missoes';
    missions.textContent = `🎯 Missões ${status.filter((m) => m.done).length}/3`;
    missions.addEventListener('click', (e) => {
      e.preventDefault();
      showMissions();
    });
    this.link.append(missions);
    for (const [href, text] of [
      ['./hangar.html', `🛩️ Hangar 🪙${loadProgress().coins}`],
      ['./ranking.html', '🏆 Ranking'],
      ['./passaporte.html', '🛂 Passaporte'],
      ['./colecao.html', `📖 Coleção ${all.found}/${all.total}`],
      ['./teste.html', testMode ? '⚙️ Teste ✓' : '⚙️ Teste'] // MODO TESTE
    ]) {
      const a = document.createElement('a');
      a.className = 'menu-link';
      a.href = href;
      a.textContent = text;
      this.link.append(a);
    }
    // "Instalar" só quando dá para instalar (Android/Chrome) ou no iPhone fora do app
    const installLink = document.createElement('a');
    installLink.className = 'menu-link';
    installLink.href = '#instalar';
    installLink.textContent = '📲 Instalar';
    installLink.addEventListener('click', (e) => {
      e.preventDefault();
      void install();
    });
    const refresh = () => {
      if (canOfferInstall()) this.link.append(installLink);
      else installLink.remove();
    };
    refresh();
    onInstallAvailabilityChange(refresh);
    document.body.append(this.link);
    music.play('menu');
  }

  update(dt: number, input: FrameInput): void {
    const { pressed } = input;
    if (input.sound) toggleSound();
    this.time += dt;
    this.background.update(dt, 60);
    this.jet.idle(dt, WORLD.height * 0.42);
    if (pressed && this.time > 0.2 && !document.querySelector('.missions-overlay')) {
      this.link.remove();
      this.manager.goToPlay(this.challenge ? { challenge: this.challenge } : undefined);
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
    if (testMode) plainText(ctx, 'MODO TESTE LIGADO', WORLD.width / 2, 210, 2, '#ff9ad5'); // MODO TESTE
    if (this.challenge) {
      panel(ctx, 236, 64);
      plainText(ctx, `DESAFIO DE ${this.challenge.from.toUpperCase()}`, WORLD.width / 2, 254, 2, '#ffd23f');
      plainText(ctx, `Mesma partida dele: faça mais de ${this.challenge.target}`, WORLD.width / 2, 278, 2, '#ffffff');
    }

    if (Math.floor(this.time * 2) % 2 === 0) {
      outlinedText(ctx, 'Toque para decolar', WORLD.width / 2, 520, 3);
    }
  }
}
