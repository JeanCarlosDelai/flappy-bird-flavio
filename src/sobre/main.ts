import '@/pwa';
import '../landing/style.css';
import '../ranking/style.css';
import '../colecao/style.css';
import './style.css';
import { TRIGGER_TEXT, VOICE_LINES } from '@/audio/voices';
import { CHASERS } from '@/entities/chaser';

/** Sobre e fontes: o que é o jogo, todas as falas reais com contexto e links, e privacidade. */
const names: Record<string, string> = { flavio: 'Flávio' };
for (const c of CHASERS) names[c.id] = c.name;

const list = document.getElementById('falas')!;
for (const line of VOICE_LINES) {
  const card = document.createElement('article');
  card.className = 'voice-card';
  card.innerHTML = `
    <p class="voice-who"></p>
    <blockquote></blockquote>
    <p class="voice-when"></p>
    <p class="voice-context"></p>
    <audio controls preload="none"></audio>
    <p class="voice-links"><a class="orig" target="_blank" rel="noopener noreferrer"></a></p>`;
  card.querySelector('.voice-who')!.textContent = names[line.who] ?? line.who;
  card.querySelector('blockquote')!.textContent = `"${line.text}"`;
  card.querySelector('.voice-when')!.textContent = `▶ Toca ${TRIGGER_TEXT[line.when]}`;
  card.querySelector('.voice-context')!.textContent = `Contexto: ${line.context}`;
  (card.querySelector('audio') as HTMLAudioElement).src = `./falas/${line.id}.mp3`;
  const orig = card.querySelector('a.orig') as HTMLAnchorElement;
  orig.href = line.originalUrl;
  orig.textContent = `Original: ${line.source} (${line.at}) ↗`;
  if (line.sourceUrl !== line.originalUrl) {
    const extra = document.createElement('a');
    extra.href = line.sourceUrl;
    extra.target = '_blank';
    extra.rel = 'noopener noreferrer';
    extra.textContent = 'Transcrição oficial ↗';
    card.querySelector('.voice-links')!.append(' · ', extra);
  }
  list.append(card);
}

// fontes agrupadas (veículo/órgão)
const outlets = new Map<string, string>();
for (const l of VOICE_LINES) {
  const outlet = /Radioagência|EBC/.test(l.source)
    ? 'Radioagência Nacional / Agência Brasil (EBC)'
    : /Planalto/.test(l.source)
      ? 'Planalto — live "Conversa com o Presidente" (trecho publicado pelo Poder360)'
      : /UOL/.test(l.source)
        ? 'UOL (YouTube)'
        : /CNN/.test(l.source)
          ? 'CNN Brasil (YouTube)'
          : l.source;
  outlets.set(outlet, (outlets.get(outlet) ? outlets.get(outlet) + ', ' : '') + (names[l.who] ?? l.who));
}
const ul = document.getElementById('fontes')!;
for (const [outlet, who] of outlets) {
  const li = document.createElement('li');
  li.innerHTML = '<b></b> — <span></span>';
  li.querySelector('b')!.textContent = outlet;
  li.querySelector('span')!.textContent = [...new Set(who.split(', '))].join(', ');
  ul.append(li);
}
