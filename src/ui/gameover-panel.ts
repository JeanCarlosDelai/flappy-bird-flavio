import { ApiError, api, nameErrorMessage } from '@/net/api';
import { STAGE_LENGTH, STAGES } from '@/render/stages';
import { rememberName, type RunSummary } from '@/systems/session';
import { deathLine, tryAgainLine } from './messages';
import { testMode } from '@/systems/test-mode';
import { progress as collectionProgress } from '@/systems/collection';

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

/** O que falta para a próxima região, sem dar nome a regiões não visitadas. */
function progressLine(summary: RunSummary): string {
  const { score } = summary.run;
  const last = summary.stage === STAGES.length - 1;
  const left = (summary.stage + 1) * STAGE_LENGTH - score;
  if (last) return `Faltaram ${left} ${left === 1 ? 'ponto' : 'pontos'} para cruzar a fronteira.`;
  return `Faltaram ${left} ${left === 1 ? 'ponto' : 'pontos'} para a próxima região.`;
}

/**
 * Painel de fim de jogo: frase, pontos, comparações, nome no ranking e botões.
 * Fica por cima do canvas e é removido ao jogar de novo.
 */
export function showGameOverPanel(summary: RunSummary, onRetry: () => void): () => void {
  const { run, history } = summary;
  const region = STAGES[summary.stage].name;

  const overlay = el('div', 'go-overlay');
  const card = el('section', 'go-card');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Fim de jogo');
  overlay.append(card);

  const escaped = run.cause === 'fuga';
  card.append(el('p', 'go-kicker', escaped ? 'Rota completa' : 'Fim da fuga'));
  card.append(el('h2', 'go-title', escaped ? 'FUGA CONCLUÍDA! ✈️' : 'Dessa vez o Flávio não fugiu!'));
  card.append(el('p', 'go-line', deathLine(run.cause, region, run.variant)));

  const score = el('div', 'go-score');
  score.append(el('strong', '', String(run.score)), el('span', '', run.score === 1 ? 'ponto' : 'pontos'));
  card.append(score);

  if (summary.newRecord && summary.previousBest > 0) card.append(el('p', 'go-badge', '🏆 Novo recorde pessoal!'));
  else if (summary.newRecord && run.score > 0) card.append(el('p', 'go-badge', '🏆 Primeiro recorde!'));

  // comparações
  const facts = el('ul', 'go-facts');
  const fact = (label: string, value: string) => {
    const li = el('li');
    li.append(el('span', '', label), el('b', '', value));
    facts.append(li);
  };
  fact('Chegou até', region);
  fact('Seu recorde', String(history.best));
  if (summary.previousScore !== null) fact('Vs. última partida', signed(run.score - summary.previousScore));
  fact('Batidas', String(run.hits));
  fact('Tempo de voo', `${Math.round(run.durationMs / 1000)} s`);
  card.append(facts);

  const progress = el('p', 'go-note', escaped ? 'Brasília → Puerto Iguazú → Guayaquil → Miami. Rota inteira!' : progressLine(summary));
  if (summary.newStage) progress.textContent = `Primeira vez em ${region}! ${progress.textContent}`;
  else if (!summary.newRecord && history.best > run.score) {
    progress.textContent += ` Faltaram ${history.best - run.score + 1} para bater seu recorde.`;
  }
  card.append(progress);

  if (run.discoveries?.length) {
    const news = el('div', 'go-news');
    news.append(el('b', '', `📖 Novo na coleção (${run.discoveries.length})`));
    news.append(el('span', '', run.discoveries.join(' · ')));
    card.append(news);
  }

  const global = el('p', 'go-global', 'Comparando com os outros jogadores…');
  card.append(global);

  // ranking
  const form = el('form', 'go-form');
  form.hidden = true;
  const label = el('label', 'go-label', 'Seu apelido no ranking');
  const input = el('input');
  input.name = 'name';
  input.maxLength = 16;
  input.minLength = 2;
  input.required = true;
  input.setAttribute('autocomplete', 'nickname');
  input.placeholder = 'Ex.: Piloto Sumido';
  input.value = history.lastName;
  label.htmlFor = input.id = 'go-name';
  const submit = el('button', 'go-btn go-btn-secondary', 'Entrar no ranking');
  submit.type = 'submit';
  const row = el('div', 'go-form-row');
  row.append(input, submit);
  const feedback = el('p', 'go-feedback');
  feedback.setAttribute('aria-live', 'polite');
  form.append(label, row, feedback);
  card.append(form);

  // ações
  const actions = el('div', 'go-actions');
  const retry = el('button', 'go-btn', `${tryAgainLine()} ▶`);
  retry.type = 'button';
  const ranking = el('a', 'go-link', '🏆 Ranking e estatísticas');
  ranking.href = './ranking.html';
  const all = collectionProgress().all;
  const collection = el('a', 'go-link', `📖 Coleção (${all.found} de ${all.total})`);
  collection.href = './colecao.html';
  const links = el('div', 'go-links');
  links.append(ranking, collection);
  actions.append(retry, links);
  card.append(actions);
  card.append(el('p', 'go-hint', 'Espaço ou Enter também jogam de novo'));

  let runId: string | null = null;
  // MODO TESTE: não manda para o ranking nem para as estatísticas online
  const report = testMode ? Promise.resolve('teste' as const) : api.reportRun(run);
  report.then((result) => {
    if (result === 'teste') {
      global.textContent = 'Modo teste: esta partida não conta para o ranking nem para o recorde.';
      return;
    }
    if (!result) {
      global.textContent = 'Ranking online indisponível agora. Seu recorde ficou salvo neste aparelho.';
      return;
    }
    runId = result.runId;
    global.textContent =
      result.totalRuns <= 1
        ? 'Você jogou a primeira partida registrada. Pioneiro!'
        : result.betterThanPercent === 0
          ? `As outras ${(result.totalRuns - 1).toLocaleString('pt-BR')} partidas foram mais longe. Dá para subir!`
          : `Foi tão longe ou mais que ${result.betterThanPercent}% das outras ${(result.totalRuns - 1).toLocaleString('pt-BR')} partidas.`;
    form.hidden = run.score <= 0;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!runId) return;
    submit.disabled = true;
    feedback.textContent = 'Salvando…';
    try {
      const res = await api.submitName(runId, input.value);
      if (!res) throw new ApiError(0, 'offline');
      rememberName(res.name);
      runId = null;
      input.disabled = true;
      feedback.textContent =
        res.best > res.score
          ? `Salvo! ${res.name} continua em ${res.position}º com ${res.best} pontos.`
          : `Salvo! ${res.name} está em ${res.position}º no ranking.`;
    } catch (err) {
      submit.disabled = false;
      feedback.textContent = nameErrorMessage(err instanceof ApiError ? err.code : 'offline');
    }
  });

  retry.addEventListener('click', onRetry);
  document.body.append(overlay);
  return () => overlay.remove();
}
