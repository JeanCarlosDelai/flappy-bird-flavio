/**
 * MODO TESTE (temporário): configurações para testar o jogo, salvas no navegador.
 * Página: /teste.html. Para remover: apagar este arquivo, teste.html, src/teste/ e os
 * trechos marcados com "MODO TESTE" (busque por essa palavra no código).
 */
import { CHASER_IDS, STAGE_LENGTH, type ChaserId } from '@server/types';

/**
 * ACESSO ao Modo teste: escondido do público. Abre só pelo link secreto
 * /teste.html?chave=<TEST_KEY>, que libera este aparelho (fica salvo).
 * Não é segurança de verdade (está no código do site); só tira o modo teste da vista.
 */
export const TEST_KEY = 'piloto-do-jatinho';
const ACCESS_KEY = 'jatinho-do-flavio:acesso-teste';

/** Aparelho liberado para o Modo teste? (ou libera agora, se a página veio com a chave certa) */
export function hasTestAccess(): boolean {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return false;
    const params = new URLSearchParams(globalThis.location?.search ?? '');
    if (params.get('chave') === TEST_KEY) ls.setItem(ACCESS_KEY, '1');
    if (params.get('chave') === 'sair') ls.removeItem(ACCESS_KEY);
    return ls.getItem(ACCESS_KEY) === '1';
  } catch {
    return false;
  }
}

export interface TestSettings {
  enabled: boolean;
  /** Pontos para passar de uma parada para a próxima. */
  stageLength: number;
  /** Parada onde a partida começa (0 = Brasília … 3 = Miami). */
  startStage: number;
  /** Perseguidores que podem aparecer. */
  chasers: ChaserId[];
  /** Duração da viagem entre paradas (segundos). */
  travelSeconds: number;
  /** Multiplicador da velocidade do jogo. */
  speed: number;
  /** Não bate nem cai. */
  invincible: boolean;
  /** Partidas de teste registram itens na Coleção. */
  collection: boolean;
  /** EVENTOS ALEATÓRIOS (prévia): ligados, qual (ou "aleatorio") e de quanto em quanto tempo. */
  events: boolean;
  event: string;
  eventInterval: number;
  /** Os perseguidores com veículo (PT, PSOL, Missão) sempre chamam o veículo. */
  vehicles: boolean;
  /** O clima da parada aparece sempre, logo no começo. */
  weather: boolean;
}

export const TEST_DEFAULTS: TestSettings = {
  enabled: false,
  stageLength: STAGE_LENGTH,
  startStage: 0,
  chasers: [...CHASER_IDS],
  travelSeconds: 5,
  speed: 1,
  invincible: false,
  collection: true,
  events: false,
  event: 'aleatorio',
  eventInterval: 15,
  vehicles: false,
  weather: false
};

const KEY = 'jatinho-do-flavio:teste';
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function loadTestSettings(): TestSettings {
  try {
    const saved = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '{}') as Partial<TestSettings>;
    const s = { ...TEST_DEFAULTS, ...saved };
    return {
      ...s,
      stageLength: clamp(Math.round(s.stageLength), 3, 200),
      startStage: clamp(Math.round(s.startStage), 0, 3),
      chasers: s.chasers.filter((c) => (CHASER_IDS as readonly string[]).includes(c)),
      travelSeconds: clamp(s.travelSeconds, 1, 15),
      speed: clamp(s.speed, 0.3, 2),
      eventInterval: clamp(s.eventInterval, 5, 120)
    };
  } catch {
    return { ...TEST_DEFAULTS };
  }
}

export function saveTestSettings(s: TestSettings): void {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(s));
  } catch {
    // sem storage
  }
}

/** Configuração ativa, ou null se o modo teste estiver desligado. */
export const testMode: TestSettings | null = (() => {
  if (!hasTestAccess()) return null; // sem acesso, o jogo ignora qualquer configuração de teste salva
  const s = loadTestSettings();
  return s.enabled ? s : null;
})();
