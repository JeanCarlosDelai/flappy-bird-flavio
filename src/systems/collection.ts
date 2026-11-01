import { CHASERS } from '@/entities/chaser';
import { VARIANTS } from '@/entities/chaser-sprites';
import { STAGES } from '@/render/stages';
import { OBSTACLE_KINDS, type ObstacleKind } from '@server/types';
import { EVENTS, EVENT_IDS } from './events';
import { testMode } from './test-mode';

/**
 * Coleção estilo "Pokédex": registra no navegador cada perseguidor (variante),
 * parada do mapa, obstáculo e evento aleatório que já apareceu.
 */
export type CollectionCategory = 'chasers' | 'stops' | 'obstacles' | 'events';

export interface CollectionItem {
  category: CollectionCategory;
  /** Id único dentro da categoria (ex.: "renan:guitarra"). */
  id: string;
  name: string;
  detail: string;
}

export interface Discovery {
  first: number;
  count: number;
}

type SavedCollection = Record<CollectionCategory, Record<string, Discovery>>;

const KEY = 'jatinho-do-flavio:colecao';

export const OBSTACLE_INFO: Record<ObstacleKind, { name: string; detail: string }> = {
  toga: { name: 'Toga e processos', detail: 'Brasília: toga pendurada em cima, pilha de processos embaixo.' },
  cpi: { name: 'Balões da CPI', detail: 'Brasília: fileira de balões balançando, com uma brecha.' },
  cupulas: { name: 'Cúpulas do Congresso', detail: 'Brasília: a cúpula em cima, a "tigela" embaixo.' },
  pf: { name: 'Helicóptero da PF', detail: 'Brasília: sobe e desce enquanto atravessa a tela.' },
  cataratas: { name: "Jatos d'água das Cataratas", detail: 'Puerto Iguazú: a cortina d\'água sobe e desce.' },
  cancela: { name: 'Cancela da ponte', detail: 'Puerto Iguazú: a barreira da fronteira abre e fecha.' },
  quati: { name: 'Quatis do Parque', detail: 'Puerto Iguazú: pulam do chão, como fazem com os turistas.' },
  cuia: { name: 'Cuia de chimarrão', detail: 'Puerto Iguazú: uma cuia gigante rola pelo ar.' },
  roda: { name: 'Roda-gigante La Perla', detail: 'Guayaquil: gira; só passa na brecha entre as cabines.' },
  iguana: { name: 'Iguanas do Parque Seminario', detail: 'Guayaquil: pulam de baixo.' },
  bananas: { name: 'Bananas do porto', detail: 'Guayaquil: caixas e cachos empilhados com uma brecha.' },
  radar: { name: 'Torre de controle', detail: 'Guayaquil: a torre bate; o feixe denuncia você.' },
  holofote: { name: 'Holofote da imigração', detail: 'Miami: o feixe varre o céu e denuncia você.' },
  predios: { name: 'Prédios de Brickell', detail: 'Miami: torres de cima e de baixo; a brecha muda de altura.' },
  pelicanos: { name: 'Pelicanos', detail: 'Miami: bando em V cruzando a tela.' },
  jacare: { name: 'Jacaré da Flórida', detail: 'Miami: salta da água e cai de volta.' }
};

/** Tudo que existe para colecionar, na ordem em que aparece na página. */
export const CATALOG: CollectionItem[] = [
  ...CHASERS.flatMap((chaser) =>
    VARIANTS[chaser.id].map((v) => ({
      category: 'chasers' as const,
      id: `${chaser.id}:${v.id}`,
      name: `${chaser.name} ${v.label}`,
      detail: `Perseguidor: ${chaser.name}`
    }))
  ),
  ...STAGES.map((s) => ({
    category: 'stops' as const,
    id: s.id,
    name: s.name,
    detail: `${s.country} · a partir de ${s.fromScore} pontos`
  })),
  ...OBSTACLE_KINDS.map((id) => ({ id, info: OBSTACLE_INFO[id] })).map(({ id, info }) => ({
    category: 'obstacles' as const,
    id,
    name: info.name,
    detail: info.detail
  })),
  ...EVENT_IDS.map((id) => ({ category: 'events' as const, id, name: EVENTS[id].name, detail: EVENTS[id].detail }))
];

// guarda em memória quando não há localStorage (testes, modo anônimo bloqueado)
const memory = new Map<string, string>();
const storage = {
  get(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  },
  set(key: string, value: string): void {
    memory.set(key, value);
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // sem storage: fica só na memória
    }
  }
};

export function loadCollection(): SavedCollection {
  const empty: SavedCollection = { chasers: {}, stops: {}, obstacles: {}, events: {} };
  try {
    const saved = JSON.parse(storage.get(KEY) ?? '{}') as Partial<SavedCollection>;
    return { ...empty, ...saved };
  } catch {
    return empty;
  }
}

/** Registra que o item apareceu. Devolve o item se for a primeira vez (novidade). */
export function discover(category: CollectionCategory, id: string, now = Date.now()): CollectionItem | null {
  if (testMode && !testMode.collection) return null; // MODO TESTE
  const item = CATALOG.find((i) => i.category === category && i.id === id);
  if (!item) return null;
  const data = loadCollection();
  const current = data[category][id];
  data[category][id] = { first: current?.first ?? now, count: (current?.count ?? 0) + 1 };
  storage.set(KEY, JSON.stringify(data));
  return current ? null : item;
}

export interface CategoryProgress {
  found: number;
  total: number;
}

export function progress(data = loadCollection()): Record<CollectionCategory | 'all', CategoryProgress> {
  const count = (category: CollectionCategory) => {
    const items = CATALOG.filter((i) => i.category === category);
    return { found: items.filter((i) => data[category][i.id]).length, total: items.length };
  };
  const chasers = count('chasers');
  const stops = count('stops');
  const obstacles = count('obstacles');
  const events = count('events');
  const parts = [chasers, stops, obstacles, events];
  return {
    chasers,
    stops,
    obstacles,
    events,
    all: { found: parts.reduce((n, p) => n + p.found, 0), total: parts.reduce((n, p) => n + p.total, 0) }
  };
}

/** Só para testes. */
export function resetCollection(): void {
  storage.set(KEY, '{}');
}
