import './style.css';
import { WORLD } from '@/core/config';
import { Jet } from '@/entities/jet';
import { Background } from '@/render/background';
import { drawRouteMap } from '@/render/map';
import { api } from '@/net/api';

/** Cena animada do topo: só Brasília e o jatinho flutuando (sem spoiler). */
function heroScene(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const background = new Background();
  const jet = new Jet(WORLD.height * 0.3);
  let last = performance.now();

  const frame = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.floor(w * dpr)) canvas.width = Math.floor(w * dpr);
    if (canvas.height !== Math.floor(h * dpr)) canvas.height = Math.floor(h * dpr);

    // preenche a tela inteira escalando pela altura e repetindo o fundo na largura
    const scale = (h * dpr) / WORLD.height;
    background.update(dt, 50);
    jet.idle(dt, WORLD.height * 0.3);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const tileW = WORLD.width * scale;
    for (let x = 0; x < canvas.width; x += tileW) {
      ctx.setTransform(scale, 0, 0, scale, x, 0);
      background.render(ctx, 0);
    }
    ctx.setTransform(scale, 0, 0, scale, Math.max(0, canvas.width * 0.12), 0);
    jet.render(ctx);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** Mapa só com a primeira região revelada. */
function initialMap(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width;
  const h = canvas.height;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr * 1.6, dpr * 1.6);
  drawRouteMap(ctx, 2, 2, w / 1.6 - 4, h / 1.6 - 4, { revealUpTo: 0, score: 0 });
}

const hero = document.querySelector<HTMLCanvasElement>('#hero-scene');
const map = document.querySelector<HTMLCanvasElement>('#map');
if (hero) heroScene(hero);
if (map) initialMap(map);

/** Top 5 do ranking geral. */
async function topFive(list: HTMLElement): Promise<void> {
  const res = await api.ranking('all');
  if (!res) {
    list.innerHTML = '<li class="muted">O ranking online chega em breve.</li>';
    return;
  }
  if (!res.entries.length) {
    list.innerHTML = '<li class="muted">Ninguém no ranking ainda. Seja o primeiro!</li>';
    return;
  }
  const medal = ['🥇', '🥈', '🥉'];
  list.replaceChildren(
    ...res.entries.slice(0, 5).map((e) => {
      const li = document.createElement('li');
      li.innerHTML = '<span></span><span></span><b></b>';
      const [pos, name, pts] = li.children;
      pos.textContent = medal[e.position - 1] ?? `${e.position}º`;
      name.textContent = e.name;
      pts.textContent = e.score.toLocaleString('pt-BR');
      return li;
    })
  );
}

const top5 = document.querySelector<HTMLElement>('#top5');
if (top5) topFive(top5);
