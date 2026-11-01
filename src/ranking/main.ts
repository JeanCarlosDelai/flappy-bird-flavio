import '../landing/style.css';
import './style.css';
import type { DeathCause, GlobalStats, ObstacleKind, RankingEntry } from '@server/types';
import { api } from '@/net/api';
import { STAGES } from '@/render/stages';
import { loadHistory } from '@/systems/session';
import { CAUSE_LABEL } from '@/ui/messages';
import { OBSTACLE_INFO } from '@/systems/collection';

const $ = (id: string) => document.getElementById(id)!;
const fmt = (n: number) => n.toLocaleString('pt-BR');
const history = loadHistory();

const OBSTACLE_LABEL = Object.fromEntries(
  Object.entries(OBSTACLE_INFO).map(([k, v]) => [k, v.name])
) as Record<ObstacleKind, string>;

function duration(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)} s`;
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${fmt(h)} h ${min % 60} min`;
}

/** Região pelo nome só se este aparelho já chegou lá (sem spoiler). */
const regionName = (i: number) => (i <= history.farthestStage ? STAGES[i].name : `Região ${i + 1} · ???`);

function tiles(target: HTMLElement, items: [string, string][]): void {
  target.replaceChildren(
    ...items.map(([value, label]) => {
      const div = document.createElement('div');
      div.className = 'tile';
      div.innerHTML = `<b></b><span></span>`;
      div.querySelector('b')!.textContent = value;
      div.querySelector('span')!.textContent = label;
      return div;
    })
  );
}

/** Barras horizontais de uma cor só, com valor e % ao lado. */
function bars(
  target: HTMLElement,
  rows: { label: string; value: number }[],
  total?: number,
  showPercent = true
): void {
  const sum = total ?? rows.reduce((s, r) => s + r.value, 0);
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!sum) {
    target.innerHTML = '<p class="empty">Sem dados ainda.</p>';
    return;
  }
  target.replaceChildren(
    ...rows.map((r) => {
      const pct = Math.round((r.value / sum) * 100);
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.title = showPercent ? `${r.label}: ${fmt(r.value)} (${pct}%)` : `${r.label}: ${fmt(r.value)}`;
      row.innerHTML = `<span class="bar-label"></span><span class="bar-track"><span class="bar-fill"></span></span><span class="bar-value"></span>`;
      row.querySelector('.bar-label')!.textContent = r.label;
      const fill = row.querySelector('.bar-fill') as HTMLElement;
      fill.style.width = `${(r.value / max) * 100}%`;
      if (r.value > 0) fill.style.minWidth = '2px';
      row.querySelector('.bar-value')!.innerHTML = showPercent ? `${fmt(r.value)} <small>${pct}%</small>` : fmt(r.value);
      return row;
    })
  );
}

const causeRows = (deaths: Record<DeathCause, number>) =>
  (Object.keys(CAUSE_LABEL) as DeathCause[]).map((c) => ({ label: CAUSE_LABEL[c], value: deaths[c] }));

function renderRanking(entries: RankingEntry[] | null): void {
  const list = $('ranking');
  if (!entries) {
    list.innerHTML = '<li class="muted">Ranking indisponível agora.</li>';
    return;
  }
  if (!entries.length) {
    list.innerHTML = '<li class="muted">Ninguém no ranking ainda. Seja o primeiro!</li>';
    return;
  }
  const medal = ['🥇', '🥈', '🥉'];
  const me = history.lastName.toLowerCase();
  list.replaceChildren(
    ...entries.map((e) => {
      const li = document.createElement('li');
      if (e.position === 1) li.classList.add('top1');
      if (me && e.name.toLowerCase() === me) li.classList.add('me');
      li.innerHTML = `<span class="pos"></span><span class="name"></span><span class="pts"></span>`;
      li.querySelector('.pos')!.textContent = medal[e.position - 1] ?? `${e.position}º`;
      li.querySelector('.name')!.textContent = e.name;
      li.querySelector('.pts')!.textContent = fmt(e.score);
      return li;
    })
  );
}

function renderGlobal(s: GlobalStats): void {
  tiles($('tiles'), [
    [fmt(s.runs), 'partidas jogadas'],
    [fmt(s.rankedPlayers), 'pilotos no ranking'],
    [fmt(s.bestScore), 'recorde geral'],
    [s.averageScore.toLocaleString('pt-BR'), 'pontos em média'],
    [duration(s.totalFlightMs), 'de voo somado'],
    [fmt(s.totalHits), 'batidas no total']
  ]);
  bars($('deaths'), causeRows(s.deaths));
  bars(
    $('stages'),
    s.reachedStage.map((v, i) => ({ label: regionName(i), value: v })),
    s.runs
  );
  bars($('buckets'), s.scoreBuckets.map((b) => ({ label: `${b.label} pontos`, value: b.count })));
  bars(
    $('obstacles'),
    (Object.keys(OBSTACLE_LABEL) as ObstacleKind[])
      .map((k) => ({ label: OBSTACLE_LABEL[k], value: s.hitsByObstacle[k] }))
      .sort((a, b) => b.value - a.value)
  );
}

function renderMine(): void {
  const h = history;
  tiles($('my-tiles'), [
    [fmt(h.runs), 'partidas'],
    [fmt(h.best), 'seu recorde'],
    [h.runs ? (Math.round((h.totalScore / h.runs) * 10) / 10).toLocaleString('pt-BR') : '0', 'pontos em média'],
    [duration(h.totalMs), 'de voo'],
    [fmt(h.totalHits), 'batidas'],
    [h.runs ? STAGES[h.farthestStage].name : '—', 'mais longe que chegou']
  ]);
  bars($('my-deaths'), causeRows(h.deaths));
  bars(
    $('my-recent'),
    h.recent.slice(0, 10).map((r) => ({
      label: new Date(r.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      value: r.score
    })),
    1,
    false
  );
}

async function loadRanking(period: 'all' | 'day'): Promise<void> {
  document.querySelectorAll<HTMLButtonElement>('.tabs button').forEach((b) => {
    b.setAttribute('aria-selected', String(b.dataset.period === period));
  });
  $('ranking').innerHTML = '<li class="muted">Carregando…</li>';
  const res = await api.ranking(period);
  renderRanking(res?.entries ?? null);
}

document.querySelectorAll<HTMLButtonElement>('.tabs button').forEach((b) =>
  b.addEventListener('click', () => loadRanking(b.dataset.period === 'day' ? 'day' : 'all'))
);

renderMine();
loadRanking('all');
api.stats().then((s) => {
  if (s) renderGlobal(s);
  else {
    $('offline').hidden = false;
    $('global').hidden = true;
  }
});
