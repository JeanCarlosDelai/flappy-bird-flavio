import { VARIANTS } from '@/entities/chaser-sprites';
import { STAGES } from '@/render/stages';

/**
 * Coleção estilo "Pokédex": registra no navegador cada perseguidor (variante),
 * parada do mapa e obstáculo que já apareceu.
 */
export type CollectionCategory = 'chasers' | 'stops' | 'obstacles';

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
const CHASER_NAMES = { lula: 'Lula', xandao: 'Xandão', renan: 'Renan Santos' } as const;

export const OBSTACLE_INFO: Record<string, { name: string; detail: string }> = {
  toga: { name: 'Toga e processos', detail: 'Toga pendurada em cima, pilha de processos embaixo.' },
  cpi: { name: 'Balões da CPI', detail: 'Fileira de balões balançando, com uma brecha.' },
  pf: { name: 'Helicóptero da PF', detail: 'Sobe e desce enquanto atravessa a tela.' },
  radar: { name: 'Radar', detail: 'A torre bate; o feixe denuncia você.' }
};

/** Tudo que existe para colecionar, na ordem em que aparece na página. */
export const CATALOG: CollectionItem[] = [
  ...(Object.keys(VARIANTS) as (keyof typeof VARIANTS)[]).flatMap((chaser) =>
    VARIANTS[chaser].map((v) => ({
      category: 'chasers' as const,
      id: `${chaser}:${v.id}`,
      name: `${CHASER_NAMES[chaser]} ${v.label}`,
      detail: `Perseguidor: ${CHASER_NAMES[chaser]}`
    }))
  ),
  ...STAGES.map((s) => ({
    category: 'stops' as const,
    id: s.id,
    name: s.name,
    detail: `${s.country} · a partir de ${s.fromScore} pontos`
  })),
  ...Object.entries(OBSTACLE_INFO).map(([id, info]) => ({
    category: 'obstacles' as const,
    id,
    name: info.name,
    detail: info.detail
  }))
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
  const empty: SavedCollection = { chasers: {}, stops: {}, obstacles: {} };
  try {
    const saved = JSON.parse(storage.get(KEY) ?? '{}') as Partial<SavedCollection>;
    return { ...empty, ...saved };
  } catch {
    return empty;
  }
}

/** Registra que o item apareceu. Devolve o item se for a primeira vez (novidade). */
export function discover(category: CollectionCategory, id: string, now = Date.now()): CollectionItem | null {
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
  return {
    chasers,
    stops,
    obstacles,
    all: { found: chasers.found + stops.found + obstacles.found, total: chasers.total + stops.total + obstacles.total }
  };
}

/** Só para testes. */
export function resetCollection(): void {
  storage.set(KEY, '{}');
}
