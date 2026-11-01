import { CHASER_IDS, DEATH_CAUSES } from '@server/types';
import { progress as collectionProgress } from './collection';
import { EVENT_IDS } from './events';
import { addCoins, grantMedal, loadProgress } from './progress';
import type { LocalHistory, RunStats } from './session';
import { STAGE_LENGTH } from '@/render/stages';

/** Medalhas (conquistas): ficam na Coleção e dão moedas. */
export interface Medal {
  id: string;
  name: string;
  detail: string;
  icon: string;
  reward: number;
  /** Conquista secreta: nome e regra escondidos até ganhar. */
  secret?: boolean;
  check: (run: RunStats, history: LocalHistory) => boolean;
}

export const MEDALS: Medal[] = [
  { id: 'primeiro-voo', icon: '🛫', name: 'Primeiro voo', detail: 'Jogar uma partida.', reward: 5, check: () => true },
  { id: 'chegou-iguazu', icon: '🌊', name: 'Fronteira cruzada', detail: 'Chegar a Puerto Iguazú.', reward: 10, check: (r) => r.score >= STAGE_LENGTH },
  { id: 'chegou-guayaquil', icon: '🏔️', name: 'Sobre os Andes', detail: 'Chegar a Guayaquil.', reward: 15, check: (r) => r.score >= STAGE_LENGTH * 2 },
  { id: 'chegou-miami', icon: '🌴', name: 'Bem-vindo a Miami', detail: 'Chegar a Miami.', reward: 20, check: (r) => r.score >= STAGE_LENGTH * 3 },
  { id: 'fuga', icon: '✈️', name: 'Fuga concluída', detail: 'Completar a rota inteira.', reward: 50, check: (r) => r.cause === 'fuga' },
  { id: 'ficha-limpa', icon: '🧼', name: 'Ficha limpa', detail: '20 pontos seguidos sem bater.', reward: 15, check: (r) => (r.cleanStreak ?? 0) >= 20 },
  { id: 'raspando', icon: '😬', name: 'No fio da navalha', detail: 'Passar raspando 5 vezes numa partida.', reward: 10, check: (r) => (r.nearMisses ?? 0) >= 5 },
  { id: 'combo', icon: '🔥', name: 'Combo de raspão', detail: 'Fazer combo 10 de raspão.', reward: 20, check: (r) => (r.bestCombo ?? 0) >= 10 },
  { id: 'por-um-triz', icon: '🚨', name: 'Por um triz', detail: 'Escapar com o perigo no vermelho.', reward: 15, check: (r) => !!r.closeCall },
  { id: 'chefe', icon: '👑', name: 'Chefão derrotado', detail: 'Sobreviver a um chefe.', reward: 15, check: (r) => (r.bosses?.length ?? 0) >= 1 },
  { id: 'chefe-miami', icon: '🔴', name: 'Alerta desligado', detail: 'Sobreviver ao chefe de Miami.', reward: 30, check: (r) => !!r.bosses?.includes('miami') },
  { id: 'blindado', icon: '🛡️', name: 'Juridicamente blindado', detail: 'Pegar 3 habeas corpus numa partida.', reward: 15, check: (r) => (r.powerups?.escudo ?? 0) >= 3 },
  { id: 'cofrinho', icon: '🪙', name: 'Cofrinho', detail: 'Juntar 100 moedas no total.', reward: 10, check: () => loadProgress().totalCoins >= 100 },
  { id: 'colecionador', icon: '📖', name: 'Colecionador', detail: 'Ter 20 itens na Coleção.', reward: 20, check: () => collectionProgress().all.found >= 20 },
  {
    id: 'procurado',
    icon: '🎯',
    name: 'Procurado por todos',
    detail: `Ser pego por todos os ${CHASER_IDS.length} perseguidores.`,
    reward: 30,
    check: (_r, h) => DEATH_CAUSES.filter((c) => c !== 'chao' && c !== 'fuga').every((c) => (h.deaths[c] ?? 0) > 0)
  },
  { id: 'desafio', icon: '📅', name: 'Desafio aceito', detail: 'Jogar o Desafio do dia.', reward: 5, check: (r) => !!r.daily },
  { id: 'volta-ao-mundo', icon: '♾️', name: 'Volta às Américas', detail: 'No modo sem fim, passar de Miami e começar a volta 2.', reward: 40, check: (r) => r.mode === 'semfim' && r.score >= STAGE_LENGTH * 4 },
  { id: 'hardcore', icon: '💀', name: 'Sangue frio', detail: 'No hardcore, chegar a Puerto Iguazú.', reward: 30, check: (r) => r.mode === 'hardcore' && r.score >= STAGE_LENGTH },
  // eventos aleatórios ("sem bater" = do aviso até o fim do evento sem levar nenhuma batida)
  { id: 'evento-fraldas', icon: '🧷', name: 'Troca de fraldas', detail: 'Passar pela chuva de fraldas sem bater.', reward: 10, check: (r) => clean(r, 'fraldas') },
  { id: 'evento-constituicao', icon: '📜', name: 'Desviou da Constituição', detail: 'Passar pela chuva de Constituição sem bater.', reward: 10, check: (r) => clean(r, 'constituicao') },
  { id: 'evento-gravidade', icon: '🙃', name: 'Liminar cassada', detail: 'Passar pela gravidade invertida sem bater.', reward: 15, check: (r) => clean(r, 'gravidade') },
  { id: 'evento-apagao', icon: '🔦', name: 'Sobreviveu ao apagão', detail: 'Passar pelo apagão sem bater.', reward: 15, check: (r) => clean(r, 'apagao') },
  { id: 'evento-moedas', icon: '💰', name: 'Chuva de dinheiro', detail: 'Pegar 10 moedas numa chuva de moedas.', reward: 10, check: (r) => (r.rainCoins ?? 0) >= 10 },
  { id: 'evento-greve', icon: '🚩', name: 'Furou a greve', detail: 'Passar pela greve geral sem bater.', reward: 15, check: (r) => clean(r, 'greve') },
  { id: 'evento-ocupacao', icon: '⛺', name: 'Reintegração de posse', detail: 'Passar pela ocupação relâmpago sem bater.', reward: 15, check: (r) => clean(r, 'ocupacao') },
  { id: 'evento-live', icon: '📱', name: 'Sem dar ibope', detail: 'Passar pela live ao vivo sem bater.', reward: 10, check: (r) => clean(r, 'live') },
  {
    id: 'evento-todos',
    icon: '⚡',
    name: 'Já vi de tudo',
    detail: `Ver os ${EVENT_IDS.length} eventos (na Coleção).`,
    reward: 20,
    check: () => collectionProgress().events.found >= EVENT_IDS.length
  },
  {
    id: 'climas',
    icon: '🌦️',
    name: 'Faça chuva ou faça sol',
    detail: 'Enfrentar os 4 climas (na Coleção).',
    reward: 15,
    check: () => collectionProgress().weather.found >= 4
  },
  {
    id: 'chefes',
    icon: '👑',
    name: 'Todos os chefes',
    detail: 'Ver os 4 chefes (na Coleção).',
    reward: 25,
    check: () => collectionProgress().bosses.found >= 4
  },
  {
    id: 'veiculos',
    icon: '🛩️',
    name: 'Frota partidária',
    detail: 'Ver os 3 veículos dos partidos (na Coleção).',
    reward: 15,
    check: () => collectionProgress().vehicles.found >= 3
  },
  // ---------- secretas ----------
  { id: 'rato', icon: '🐀', name: 'Rato de laboratório', detail: 'Ser pego 5 vezes pelo Kim versão rato.', reward: 25, secret: true, check: (_r, h) => (h.variantDeaths['kim:rato'] ?? 0) >= 5 },
  { id: 'zero', icon: '🥚', name: 'Decolagem cancelada', detail: 'Terminar 3 partidas seguidas com 0 pontos.', reward: 10, secret: true, check: (_r, h) => h.zeroStreak >= 3 },
  { id: 'insone', icon: '🌙', name: 'Fuga de madrugada', detail: 'Jogar entre meia-noite e 5 da manhã.', reward: 10, secret: true, check: (r) => r.startHour !== undefined && r.startHour < 5 },
  { id: 'turista', icon: '📸', name: 'Turista', detail: 'Pausar 10 vezes numa partida.', reward: 10, secret: true, check: (r) => (r.pauses ?? 0) >= 10 },
  { id: 'viciado', icon: '🎮', name: 'Só mais uma', detail: 'Jogar 50 partidas.', reward: 30, secret: true, check: (_r, h) => h.runs >= 50 },
  { id: 'ficha', icon: '📁', name: 'Ficha corrida', detail: 'Somar 100 batidas no total.', reward: 15, secret: true, check: (_r, h) => h.totalHits >= 100 },
  { id: 'intocavel', icon: '🧊', name: 'Intocável', detail: 'Vencer um chefe sem levar nenhuma batida.', reward: 30, secret: true, check: (r) => (r.bossesClean?.length ?? 0) >= 1 },
  { id: 'janela', icon: '🪟', name: 'Vento na cara', detail: 'Completar uma fuga com uma skin do Flávio na janela.', reward: 30, secret: true, check: (r) => r.cause === 'fuga' && !!r.skin?.startsWith('flavio') }
];

function clean(run: RunStats, event: string): boolean {
  return !!run.eventsClean?.includes(event);
}

/** Confere as medalhas no fim da partida; dá as moedas das novas. */
export function evaluateMedals(run: RunStats, history: LocalHistory): Medal[] {
  const unlocked = MEDALS.filter((m) => m.check(run, history) && grantMedal(m.id));
  const reward = unlocked.reduce((sum, m) => sum + m.reward, 0);
  if (reward) addCoins(reward);
  return unlocked;
}
