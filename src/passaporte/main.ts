import '@/pwa';
import '../landing/style.css';
import '../ranking/style.css';
import './style.css';
import { jetSprite } from '@/entities/jet';
import { STAGES } from '@/render/stages';
import { loadCollection, progress as collectionProgress } from '@/systems/collection';
import { MEDALS } from '@/systems/medals';
import { missionStatus } from '@/systems/missions';
import { loadProgress } from '@/systems/progress';
import { loadHistory } from '@/systems/session';

/** PASSAPORTE: carimbos dos países visitados e a ficha do fugitivo. */
const history = loadHistory();
const prog = loadProgress();
const stops = loadCollection().stops;
const date = (t: number | null | undefined) => (t ? new Date(t).toLocaleDateString('pt-BR') : '—');
const seconds = (ms: number) => {
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`;
};

// capa: foto 3x4 (o jatinho equipado, ampliado) e dados
const passport = document.getElementById('passport')!;
const photo = document.createElement('canvas');
const sprite = jetSprite(0, 0);
photo.width = sprite.width * 3;
photo.height = sprite.height * 3;
const pctx = photo.getContext('2d')!;
pctx.imageSmoothingEnabled = false;
pctx.drawImage(sprite, 0, 0, photo.width, photo.height);
photo.className = 'pp-photo';
const info = document.createElement('div');
info.className = 'pp-info';
const rows: [string, string][] = [
  ['Nome', 'Flávio'],
  ['Situação', history.deaths.fuga > 0 ? 'Fugitivo honorário' : 'Ainda em Brasília'],
  ['Emitido em', date(history.firstRunAt)],
  ['Validade', 'Até o Xandão decidir']
];
for (const [k, v] of rows) {
  const row = document.createElement('p');
  row.innerHTML = '<span></span><b></b>';
  row.querySelector('span')!.textContent = k;
  row.querySelector('b')!.textContent = v;
  info.append(row);
}
const mrz = document.createElement('code');
mrz.className = 'pp-mrz';
mrz.textContent = `P<BRAFLAVIO<<JATINHO<<<<<<<<<<${String(history.best).padStart(4, '0')}<<${history.runs}`;
passport.append(photo, info, mrz);

// carimbos
const COUNTRY_COLORS: Record<string, string> = { brasilia: '#2fa34f', iguazu: '#2b6fd6', guayaquil: '#c99a10', miami: '#d33a2c' };
const stamps = document.getElementById('stamps')!;
STAGES.forEach((stage, i) => {
  const seen = stops[stage.id];
  const el = document.createElement('div');
  el.className = `stamp${seen ? '' : ' empty'}`;
  el.style.setProperty('--c', COUNTRY_COLORS[stage.id]);
  el.style.setProperty('--r', `${[-8, 5, -3, 9][i]}deg`);
  el.innerHTML = '<small></small><b></b><span></span>';
  el.querySelector('small')!.textContent = seen ? stage.country.toUpperCase() : '';
  el.querySelector('b')!.textContent = seen ? stage.name : '?';
  el.querySelector('span')!.textContent = seen ? `${i === 0 ? 'SAÍDA' : 'ENTRADA'} · ${date(seen.first)}` : 'ainda não carimbado';
  stamps.append(el);
});

// ficha
const col = collectionProgress().all;
const missions = missionStatus();
const stats: [string, string][] = [
  ['Partidas', String(history.runs)],
  ['Fugas completas', String(history.deaths.fuga ?? 0)],
  ['Fuga mais rápida', history.fastestEscapeMs ? seconds(history.fastestEscapeMs) : '—'],
  ['Recorde (normal)', String(history.best)],
  ['Recorde (sem fim)', String(history.bestByMode.semfim ?? 0)],
  ['Recorde (hardcore)', String(history.bestByMode.hardcore ?? 0)],
  ['Tempo de voo', seconds(history.totalMs)],
  ['Batidas', String(history.totalHits)],
  ['Moedas juntadas', String(prog.totalCoins)],
  ['Medalhas', `${Object.keys(prog.medals).length} de ${MEDALS.length}`],
  ['Coleção', `${col.found} de ${col.total}`],
  ['Missões de hoje', `${missions.filter((m) => m.done).length} de 3`],
  ['Quem mais te pegou', mostCaught()]
];
const dl = document.getElementById('stats')!;
for (const [k, v] of stats) {
  const dt = document.createElement('dt');
  dt.textContent = k;
  const dd = document.createElement('dd');
  dd.textContent = v;
  dl.append(dt, dd);
}

function mostCaught(): string {
  const names: Record<string, string> = {
    lula: 'Lula', xandao: 'Xandão', janja: 'Janja', pf: 'Agente da PF', renan: 'Renan Santos', gonet: 'Gonet', dino: 'Dino',
    interpol: 'Interpol', gleisi: 'Gleisi', haddad: 'Haddad', lindbergh: 'Lindbergh', boulos: 'Boulos', erika: 'Erika Hilton', kim: 'Kim Kataguiri'
  };
  const top = Object.entries(history.deaths)
    .filter(([cause, n]) => cause !== 'chao' && cause !== 'fuga' && n > 0)
    .sort((a, b) => b[1] - a[1])[0];
  return top ? `${names[top[0]] ?? top[0]} (${top[1]}x)` : '—';
}
