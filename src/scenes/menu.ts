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
import { saveSettings, settings } from '@/systems/settings';
import { canOfferInstall, install } from '@/pwa';
import { drawSoundButton, toggleSound } from '@/ui/sound-button';
import { challengeFromUrl, type Scene, type SceneManager } from './scene';

interface SheetItem {
  icon: string;
  title: string;
  sub: string;
  href?: string;
  action?: () => void;
}

/** Painel por cima do menu com botões grandes (um por linha). */
function showSheet(title: string, items: SheetItem[]): void {
  document.querySelector('.menu-sheet')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'go-overlay menu-sheet';
  const card = document.createElement('section');
  card.className = 'go-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', title);
  const h = document.createElement('h2');
  h.className = 'go-title';
  h.textContent = title;
  const list = document.createElement('div');
  list.className = 'sheet-list';
  for (const item of items) {
    const a = document.createElement('a');
    a.className = 'sheet-item';
    a.href = item.href ?? '#';
    a.innerHTML = '<span class="sheet-icon"></span><span class="sheet-text"><b></b><small></small></span>';
    a.querySelector('.sheet-icon')!.textContent = item.icon;
    a.querySelector('b')!.textContent = item.title;
    a.querySelector('small')!.textContent = item.sub;
    if (item.action) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        item.action!();
      });
    }
    list.append(a);
  }
  const close = document.createElement('button');
  close.className = 'go-btn go-btn-secondary sheet-close';
  close.type = 'button';
  close.textContent = 'Fechar';
  const dismiss = () => overlay.remove();
  close.addEventListener('click', dismiss);
  overlay.addEventListener('click', (e) => e.target === overlay && dismiss());
  card.append(h, list, close);
  overlay.append(card);
  document.body.append(overlay);
}

/** Janela de ajustes: volumes, vibração, reduzir efeitos e qualidade. */
function showSettings(): void {
  document.querySelector('.menu-sheet')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'go-overlay menu-sheet';
  const card = document.createElement('section');
  card.className = 'go-card settings-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Ajustes');
  card.innerHTML = `
    <h2 class="go-title">🎚️ Ajustes</h2>
    <label class="set-row">🎵 Música <output name="mv"></output>
      <input type="range" name="music" min="0" max="100" step="5" /></label>
    <label class="set-row">🔊 Efeitos <output name="sv"></output>
      <input type="range" name="sfx" min="0" max="100" step="5" /></label>
    <label class="set-check"><input type="checkbox" name="vibration" /> 📳 Vibrar ao bater</label>
    <label class="set-check"><input type="checkbox" name="reduce" /> 🌫️ Reduzir efeitos <small>(sem flashes, raios, confete e tremidas)</small></label>
    <div class="set-row">🖼️ Gráficos
      <div class="set-choices">
        <label><input type="radio" name="quality" value="auto" /> Automático</label>
        <label><input type="radio" name="quality" value="alta" /> Completo</label>
        <label><input type="radio" name="quality" value="leve" /> Leve</label>
      </div>
      <small>Automático deixa leve sozinho se o celular ficar lento.</small>
    </div>`;
  const q = <T extends Element>(sel: string) => card.querySelector(sel) as unknown as T;
  const music = q<HTMLInputElement>('[name=music]');
  const sfx = q<HTMLInputElement>('[name=sfx]');
  const fill = () => {
    music.value = String(Math.round(settings.musicVolume * 100));
    sfx.value = String(Math.round(settings.sfxVolume * 100));
    q<HTMLOutputElement>('[name=mv]').value = `${music.value}%`;
    q<HTMLOutputElement>('[name=sv]').value = `${sfx.value}%`;
    q<HTMLInputElement>('[name=vibration]').checked = settings.vibration;
    q<HTMLInputElement>('[name=reduce]').checked = settings.reduceEffects;
    for (const r of card.querySelectorAll<HTMLInputElement>('[name=quality]')) r.checked = r.value === settings.quality;
  };
  card.addEventListener('input', () => {
    saveSettings({
      musicVolume: Number(music.value) / 100,
      sfxVolume: Number(sfx.value) / 100,
      vibration: q<HTMLInputElement>('[name=vibration]').checked,
      reduceEffects: q<HTMLInputElement>('[name=reduce]').checked,
      quality: (card.querySelector<HTMLInputElement>('[name=quality]:checked')?.value ?? 'auto') as 'auto'
    });
    fill();
  });
  fill();
  const close = document.createElement('button');
  close.className = 'go-btn sheet-close';
  close.type = 'button';
  close.textContent = 'Pronto';
  const dismiss = () => overlay.remove();
  close.addEventListener('click', dismiss);
  overlay.addEventListener('click', (e) => e.target === overlay && dismiss());
  card.append(close);
  overlay.append(card);
  document.body.append(overlay);
}

/** Janela com as missões do dia. */
function showMissions(): void {
  document.querySelector('.menu-sheet')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'go-overlay menu-sheet';
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
    // tela inicial limpa: só "Modos" e "Mais"; o resto abre num painel
    this.link = document.createElement('div');
    this.link.className = 'menu-links';
    const done = missionStatus().filter((m) => m.done).length;
    const button = (text: string, onClick: () => void) => {
      const a = document.createElement('a');
      a.className = 'menu-link';
      a.href = '#';
      a.textContent = text;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        onClick();
      });
      return a;
    };
    this.link.append(
      button('🎮 Modos', () => this.showModes()),
      button(`☰ Mais${done < 3 ? ` · 🎯${done}/3` : ''}`, () => this.showMore())
    );
    document.body.append(this.link);
    music.play('menu');
  }

  private start(options?: Parameters<SceneManager['goToPlay']>[0]): void {
    document.querySelector('.menu-sheet')?.remove();
    this.link.remove();
    this.manager.goToPlay(options);
  }

  /** Painel com os modos de jogo. */
  private showModes(): void {
    showSheet('🎮 Modos de jogo', [
      { icon: '✈️', title: 'Normal', sub: 'Brasília → Miami, com ranking', action: () => this.start(this.challenge ? { challenge: this.challenge } : undefined) },
      { icon: '📅', title: 'Desafio do dia', sub: 'A mesma partida para todo mundo hoje', action: () => this.start({ daily: true }) },
      { icon: '♾️', title: 'Sem fim', sub: 'Depois de Miami a rota recomeça', action: () => this.start({ mode: 'semfim' }) },
      { icon: '💀', title: 'Hardcore', sub: 'Uma batida e acabou', action: () => this.start({ mode: 'hardcore' }) }
    ]);
  }

  /** Painel com o resto: missões, hangar, ranking, passaporte, coleção… */
  private showMore(): void {
    const all = progress().all;
    const done = missionStatus().filter((m) => m.done).length;
    const items: SheetItem[] = [
      { icon: '🎯', title: 'Missões do dia', sub: `${done} de 3 concluídas`, action: () => showMissions() },
      { icon: '🎚️', title: 'Ajustes', sub: 'Som, vibração, efeitos e gráficos', action: () => showSettings() },
      { icon: '🛩️', title: 'Hangar', sub: `${loadProgress().coins} moedas`, href: './hangar.html' },
      { icon: '🏆', title: 'Ranking', sub: 'Recordes e estatísticas', href: './ranking.html' },
      { icon: '📖', title: 'Coleção', sub: `${all.found} de ${all.total}`, href: './colecao.html' },
      { icon: '🛂', title: 'Passaporte', sub: 'Carimbos e ficha', href: './passaporte.html' },
      { icon: '⚙️', title: 'Modo teste', sub: testMode ? 'Ligado' : 'Desligado', href: './teste.html' } // MODO TESTE
    ];
    if (canOfferInstall()) items.push({ icon: '📲', title: 'Instalar', sub: 'Jogar como app', action: () => void install() });
    showSheet('☰ Mais', items);
  }

  update(dt: number, input: FrameInput): void {
    const { pressed } = input;
    if (input.sound) toggleSound();
    this.time += dt;
    this.background.update(dt, 60);
    this.jet.idle(dt, WORLD.height * 0.42);
    if (pressed && this.time > 0.2 && !document.querySelector('.menu-sheet')) {
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
