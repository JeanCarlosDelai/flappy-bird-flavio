import { DEATH_CAUSES } from '@server/types';
import { progress as collectionProgress } from './collection';
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
    detail: 'Ser pego por todos os 8 perseguidores.',
    reward: 30,
    check: (_r, h) => DEATH_CAUSES.filter((c) => c !== 'chao' && c !== 'fuga').every((c) => (h.deaths[c] ?? 0) > 0)
  },
  { id: 'desafio', icon: '📅', name: 'Desafio aceito', detail: 'Jogar o Desafio do dia.', reward: 5, check: (r) => !!r.daily },
  // eventos aleatórios ("sem bater" = do aviso até o fim do evento sem levar nenhuma batida)
  { id: 'evento-fraldas', icon: '🧷', name: 'Troca de fraldas', detail: 'Passar pela chuva de fraldas sem bater.', reward: 10, check: (r) => clean(r, 'fraldas') },
  { id: 'evento-constituicao', icon: '📜', name: 'Desviou da Constituição', detail: 'Passar pela chuva de Constituição sem bater.', reward: 10, check: (r) => clean(r, 'constituicao') },
  { id: 'evento-gravidade', icon: '🙃', name: 'Liminar cassada', detail: 'Passar pela gravidade invertida sem bater.', reward: 15, check: (r) => clean(r, 'gravidade') },
  { id: 'evento-apagao', icon: '🔦', name: 'Sobreviveu ao apagão', detail: 'Passar pelo apagão sem bater.', reward: 15, check: (r) => clean(r, 'apagao') },
  { id: 'evento-moedas', icon: '💰', name: 'Chuva de dinheiro', detail: 'Pegar 10 moedas numa chuva de moedas.', reward: 10, check: (r) => (r.rainCoins ?? 0) >= 10 },
  { id: 'evento-todos', icon: '⚡', name: 'Já vi de tudo', detail: 'Ver os 5 eventos (na Coleção).', reward: 20, check: () => collectionProgress().events.found >= 5 }
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
