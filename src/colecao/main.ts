import '@/pwa';
import '../landing/style.css';
import '../ranking/style.css';
import './style.css';
import { VARIANTS, variantSprite } from '@/entities/chaser-sprites';
import { obstaclePreview } from '@/entities/obstacle-preview';
import { eventIcon, type EventId } from '@/systems/events';
import type { ObstacleKind } from '@server/types';
import { Background } from '@/render/background';
import { STAGES } from '@/render/stages';
import { CATALOG, loadCollection, progress, type CollectionCategory, type CollectionItem } from '@/systems/collection';
import { MEDALS } from '@/systems/medals';
import { loadProgress } from '@/systems/progress';

const SECTIONS: { category: CollectionCategory; title: string }[] = [
  { category: 'chasers', title: '🏃 Perseguidores' },
  { category: 'stops', title: '🗺️ Paradas da rota' },
  { category: 'obstacles', title: '🚧 Obstáculos' },
  { category: 'events', title: '⚡ Eventos' }
];

const data = loadCollection();
const DAY = 24 * 60 * 60 * 1000;

/** Desenha a imagem do item num canvas (em pixels da arte). */
function picture(item: CollectionItem): HTMLCanvasElement {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const put = (sprite: HTMLCanvasElement, x: number, y: number) => ctx.drawImage(sprite, Math.round(x), Math.round(y));

  if (item.category === 'chasers') {
    const [chaserId, variantId] = item.id.split(':') as [keyof typeof VARIANTS, string];
    const variant = VARIANTS[chaserId].find((v) => v.id === variantId)!;
    const sprite = variantSprite(chaserId, variant);
    // largura mínima igual à dos outros; quem é mais largo (Renan das fraldas) ganha espaço
    c.width = Math.max(44, sprite.width + 8);
    c.height = 40;
    ctx.imageSmoothingEnabled = false;
    put(sprite, (c.width - sprite.width) / 2, 3);
  } else if (item.category === 'stops') {
    // cenário em tamanho da arte (180x320) mostrando a parte de baixo, onde fica a cidade
    c.width = 180;
    c.height = 150;
    ctx.translate(0, -170);
    ctx.scale(0.5, 0.5);
    new Background().render(ctx, STAGES.find((s) => s.id === item.id)!.fromScore);
  } else if (item.category === 'events') {
    return eventIcon(item.id as EventId);
  } else {
    return obstaclePreview(item.id as ObstacleKind);
  }
  return c;
}

/** Silhueta: só a forma, em escuro. */
function silhouette(canvas: HTMLCanvasElement, category: CollectionCategory): void {
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(1, 0, 0, 1, 0, 0); // o cenário foi desenhado com escala; volta ao normal
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = category === 'stops' ? 'rgba(11, 13, 30, 0.97)' : '#0b0f1c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#5d6a85';
  ctx.font = `bold ${Math.round(canvas.height * 0.4)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (category === 'stops') ctx.fillText('?', canvas.width / 2, canvas.height / 2);
}

function card(item: CollectionItem, index: number): HTMLElement {
  const found = data[item.category][item.id];
  const el = document.createElement('article');
  el.className = `dex-card${found ? '' : ' locked'}`;
  const pic = picture(item);
  if (!found) silhouette(pic, item.category);

  const num = document.createElement('span');
  num.className = 'dex-num';
  num.textContent = `#${String(index + 1).padStart(2, '0')}`;
  const title = document.createElement('h3');
  title.textContent = found ? item.name : '???';
  const info = document.createElement('p');
  info.textContent = found
    ? `${item.detail} · visto ${found.count}x · desde ${new Date(found.first).toLocaleDateString('pt-BR')}`
    : 'Ainda não apareceu';
  el.append(num, pic, title, info);
  if (found && Date.now() - found.first < DAY) {
    const tag = document.createElement('span');
    tag.className = 'dex-new';
    tag.textContent = 'NOVO';
    el.append(tag);
  }
  return el;
}

/** Medalhas: mostram a meta mesmo bloqueadas (para saber o que fazer). */
function medalsSection(): HTMLElement {
  const got = loadProgress().medals;
  const section = document.createElement('section');
  const head = document.createElement('div');
  head.className = 'dex-head';
  head.innerHTML = '<h2>🏅 Medalhas</h2><span class="count"></span>';
  head.querySelector('.count')!.textContent = `${MEDALS.filter((m) => got[m.id]).length} de ${MEDALS.length}`;
  const grid = document.createElement('div');
  grid.className = 'dex-grid';
  grid.append(
    ...MEDALS.map((m) => {
      const when = got[m.id];
      const card = document.createElement('article');
      card.className = `dex-card medal${when ? '' : ' locked'}`;
      card.innerHTML = '<div class="medal-icon"></div><h3></h3><p></p>';
      card.querySelector('.medal-icon')!.textContent = when ? m.icon : '🔒';
      card.querySelector('h3')!.textContent = m.name;
      card.querySelector('p')!.textContent = when
        ? `${m.detail} · ganhou em ${new Date(when).toLocaleDateString('pt-BR')} · +${m.reward} 🪙`
        : `${m.detail} · vale ${m.reward} 🪙`;
      return card;
    })
  );
  section.append(head, grid);
  return section;
}

function render(): void {
  const p = progress(data);
  const pct = Math.round((p.all.found / p.all.total) * 100);
  document.getElementById('total')!.innerHTML =
    `<b>${p.all.found} de ${p.all.total}</b> descobertos (${pct}%)<div class="dex-bar"><span style="width:${pct}%"></span></div>`;

  const sections = document.getElementById('sections')!;
  let index = 0;
  sections.replaceChildren(
    ...SECTIONS.map(({ category, title }) => {
      const section = document.createElement('section');
      const head = document.createElement('div');
      head.className = 'dex-head';
      head.innerHTML = `<h2></h2><span class="count"></span>`;
      head.querySelector('h2')!.textContent = title;
      head.querySelector('.count')!.textContent = `${p[category].found} de ${p[category].total}`;
      const grid = document.createElement('div');
      grid.className = 'dex-grid';
      grid.append(...CATALOG.filter((i) => i.category === category).map((i) => card(i, index++)));
      section.append(head, grid);
      return section;
    }),
    medalsSection()
  );
}

render();
