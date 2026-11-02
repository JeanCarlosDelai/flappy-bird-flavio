import { ApiError, api, nameErrorMessage } from '@/net/api';
import { STAGE_LENGTH, STAGES, finalStageIndex, lapForScore, stageIndexForScore } from '@/render/stages';
import { rememberName, type RunSummary } from '@/systems/session';
import { deathLine, tryAgainLine } from './messages';
import { shareResult } from './share';
import { hasReplay, replayGif } from './replay';
import { challengeLink } from '@/scenes/scene';
import type { Medal } from '@/systems/medals';
import { missionStatus, type Mission } from '@/systems/missions';
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
  if (summary.run.mode === 'semfim') return `Volta ${lapForScore(score)} da rota, em ${STAGES[stageIndexForScore(score)].name}.`;
  const last = summary.stage === STAGES.length - 1;
  const left = (summary.stage + 1) * STAGE_LENGTH - score;
  if (last) return `Faltaram ${left} ${left === 1 ? 'ponto' : 'pontos'} para cruzar a fronteira.`;
  return `Faltaram ${left} ${left === 1 ? 'ponto' : 'pontos'} para a próxima região.`;
}

/**
 * Painel de fim de jogo: frase, pontos, comparações, nome no ranking e botões.
 * Fica por cima do canvas e é removido ao jogar de novo.
 */
export interface GameOverExtras {
  coinsRun: number;
  coinsTotal: number;
  medals: Medal[];
  dailyBest: number | null;
  missions: Mission[];
}

export function showGameOverPanel(summary: RunSummary, onRetry: () => void, extras?: GameOverExtras): () => void {
  const { run, history } = summary;
  const region = STAGES[finalStageIndex(run.score, run.mode === 'semfim')].name;
  const modeName = run.mode === 'semfim' ? 'Modo sem fim' : run.mode === 'hardcore' ? 'Modo hardcore' : null;

  const overlay = el('div', 'go-overlay');
  const card = el('section', 'go-card');
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Fim de jogo');
  overlay.append(card);

  const escaped = run.cause === 'fuga';
  card.append(el('p', 'go-kicker', `${escaped ? 'Rota completa' : 'Fim da fuga'}${modeName ? ` · ${modeName}` : ''}`));
  card.append(el('h2', 'go-title', escaped ? 'FUGA CONCLUÍDA! ✈️' : 'Dessa vez o Flávio não fugiu!'));
  const phrase = deathLine(run.cause, region, run.variant);
  card.append(el('p', 'go-line', phrase));

  const score = el('div', 'go-score');
  score.append(el('strong', '', String(run.score)), el('span', '', run.score === 1 ? 'ponto' : 'pontos'));
  card.append(score);

  if (run.challenge) {
    const beat = run.score > run.challenge.target;
    card.append(
      el(
        'p',
        beat ? 'go-badge' : 'go-note',
        beat
          ? `⚔️ Você venceu o desafio de ${run.challenge.from} (${run.challenge.target})!`
          : `⚔️ Desafio de ${run.challenge.from}: faltaram ${run.challenge.target - run.score + 1} pontos.`
      )
    );
  }
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
  fact(modeName ? `Seu recorde (${modeName.replace('Modo ', '')})` : 'Seu recorde', String(summary.best));
  if (summary.previousScore !== null) fact('Vs. última partida', signed(run.score - summary.previousScore));
  fact('Batidas', String(run.hits));
  fact('Tempo de voo', `${Math.round(run.durationMs / 1000)} s`);
  card.append(facts);

  // moedas, medalhas e Desafio do dia
  if (extras) {
    const rewards = el('div', 'go-rewards');
    const medalCoins = extras.medals.reduce((sum, m) => sum + m.reward, 0);
    const missionCoins = extras.missions.reduce((sum, m) => sum + m.reward, 0);
    rewards.append(el('b', '', `🪙 +${extras.coinsRun + medalCoins + missionCoins} moedas · total ${extras.coinsTotal}`));
    for (const m of extras.medals) rewards.append(el('span', 'go-medal', `${m.icon} Medalha: ${m.name} (+${m.reward})`));
    for (const m of extras.missions) rewards.append(el('span', 'go-medal', `🎯 Missão concluída: ${m.text} (+${m.reward})`));
    // missões do dia (progresso)
    const status = missionStatus();
    const doneCount = status.filter((s) => s.done).length;
    const list = el('span', 'go-missions', `🎯 Missões do dia ${doneCount}/3: ` +
      status.map((s) => `${s.done ? '✅' : '▫️'} ${s.mission.text} (${s.value}/${s.mission.target})`).join(' · '));
    rewards.append(list);
    if (extras.dailyBest !== null) rewards.append(el('span', '', `📅 Desafio do dia · seu melhor hoje: ${extras.dailyBest}`));
    card.append(rewards);
  }

  const progress = el('p', 'go-note', escaped ? 'Brasília → Puerto Iguazú → Guayaquil → Miami. Rota inteira!' : progressLine(summary));
  if (summary.newStage) progress.textContent = `Primeira vez em ${region}! ${progress.textContent}`;
  else if (!summary.newRecord && summary.best > run.score) {
    progress.textContent += ` Faltaram ${summary.best - run.score + 1} para bater seu recorde.`;
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
  const hangar = el('a', 'go-link', '🛩️ Hangar');
  hangar.href = './hangar.html';
  const pass = el('a', 'go-link', '🛂 Passaporte');
  pass.href = './passaporte.html';
  links.append(ranking, collection, hangar, pass);
  const share = el('button', 'go-btn go-btn-secondary go-share', '📤 Compartilhar resultado');
  share.type = 'button';
  share.addEventListener('click', async () => {
    share.disabled = true;
    const result = await shareResult(summary, { line: phrase, medals: extras?.medals.length ?? 0 });
    share.disabled = false;
    if (result === 'downloaded') share.textContent = '✅ Imagem baixada';
  });
  // desafiar um amigo: link com a semente desta partida
  const duel = el('button', 'go-btn go-btn-secondary go-share', '⚔️ Desafiar um amigo');
  duel.type = 'button';
  duel.hidden = !run.seed || run.daily === true || (run.mode !== undefined && run.mode !== 'normal');
  duel.addEventListener('click', async () => {
    const url = challengeLink(run.seed!, run.score, history.lastName);
    const text = `Fiz ${run.score} pontos no Jatinho do Flávio. Te desafio a fugir mais longe na MESMA partida:`;
    try {
      if (navigator.share) await navigator.share({ title: 'Desafio · Jatinho do Flávio', text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        duel.textContent = '✅ Link copiado! Mande para alguém';
      }
    } catch {
      // cancelado
    }
  });
  // replay: GIF dos últimos segundos
  const replay = el('button', 'go-btn go-btn-secondary go-share', '🎞️ Baixar replay (GIF)');
  replay.type = 'button';
  replay.hidden = !hasReplay();
  replay.addEventListener('click', async () => {
    replay.disabled = true;
    replay.textContent = '⏳ Gerando o GIF…';
    const blob = await replayGif();
    replay.disabled = false;
    if (!blob) return;
    const file = new File([blob], 'jatinho-do-flavio-replay.gif', { type: 'image/gif' });
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: 'Replay · Jatinho do Flávio' });
        replay.textContent = '🎞️ Replay (GIF)';
        return;
      } catch {
        // cancelado: cai no download
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    replay.textContent = '✅ Replay baixado';
  });
  actions.append(share, duel, replay, links);
  card.append(actions);
  card.append(el('p', 'go-hint', 'Espaço ou Enter também jogam de novo'));
  // "jogar de novo" preso no rodapé: sempre à mão, mesmo em tela pequena
  const sticky = el('div', 'go-sticky');
  sticky.append(retry);
  card.append(sticky);

  let runId: string | null = null;
  // MODO TESTE: não manda para o ranking nem para as estatísticas online
  // modos sem fim e hardcore: recorde só no aparelho (o ranking é do modo normal)
  const report = testMode ? Promise.resolve('teste' as const) : modeName ? Promise.resolve('modo' as const) : api.reportRun(run);
  report.then((result) => {
    if (result === 'teste') {
      global.textContent = 'Modo teste: esta partida não conta para o ranking nem para o recorde.';
      return;
    }
    if (result === 'modo') {
      global.textContent = `${modeName}: o recorde fica salvo neste aparelho (o ranking online é do modo normal).`;
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
