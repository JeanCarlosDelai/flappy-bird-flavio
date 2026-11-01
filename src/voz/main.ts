import '@/pwa';
import '../landing/style.css';
import '../ranking/style.css';
import './style.css';
import { QUOTES, type Speaker } from '@/content/quotes';

interface Choice {
  voice: string;
  pitch: number;
  rate: number;
}

const KEY = 'jatinho-do-flavio:vozes';
const SPEAKERS: { id: Speaker; name: string; hint: string; pitch: number; rate: number }[] = [
  { id: 'lula', name: 'Lula', hint: 'sugestão: grave e calma', pitch: 0.8, rate: 0.9 },
  { id: 'xandao', name: 'Xandão', hint: 'sugestão: grave e seca', pitch: 0.7, rate: 0.95 },
  { id: 'renan', name: 'Renan Santos', hint: 'sugestão: rápida', pitch: 1.05, rate: 1.2 },
  { id: 'flavio', name: 'Flávio', hint: 'sugestão: aguda e afobada', pitch: 1.2, rate: 1.15 }
];

const $ = (id: string) => document.getElementById(id)!;
const saved: Partial<Record<Speaker, Choice>> = JSON.parse(localStorage.getItem(KEY) ?? '{}');

function ptVoices(): SpeechSynthesisVoice[] {
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('pt'))
    .sort((a, b) => Number(b.lang.toLowerCase() === 'pt-br') - Number(a.lang.toLowerCase() === 'pt-br') || a.name.localeCompare(b.name));
}

function speak(text: string, choice: Choice): void {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = speechSynthesis.getVoices().find((v) => v.name === choice.voice);
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? 'pt-BR';
  u.pitch = choice.pitch;
  u.rate = choice.rate;
  speechSynthesis.speak(u);
}

function updateResult(): void {
  const out: Record<string, Choice> = {};
  for (const s of SPEAKERS) if (saved[s.id]) out[s.id] = saved[s.id]!;
  ($('result') as HTMLTextAreaElement).value = JSON.stringify(out, null, 2);
  localStorage.setItem(KEY, JSON.stringify(saved));
}

function render(): void {
  const voices = ptVoices();
  const status = $('status');
  if (!('speechSynthesis' in window)) {
    status.textContent = 'Este navegador não tem vozes sintetizadas. Tente no Chrome do celular.';
    return;
  }
  if (!voices.length) {
    status.textContent = 'Nenhuma voz em português encontrada ainda. No Android, instale/atualize "Serviços de voz do Google"; no PC, use o Chrome.';
  } else {
    status.textContent = `${voices.length} voz(es) em português encontradas neste aparelho.`;
  }

  const grid = $('chars');
  grid.replaceChildren(
    ...SPEAKERS.map((s) => {
      const choice: Choice = saved[s.id] ?? { voice: voices[0]?.name ?? '', pitch: s.pitch, rate: s.rate };
      saved[s.id] = choice;
      const card = document.createElement('article');
      card.className = 'voice-card';

      const h = document.createElement('h3');
      h.textContent = s.name;
      const hint = document.createElement('p');
      hint.className = 'muted small';
      hint.textContent = s.hint;

      const select = document.createElement('select');
      for (const v of voices) {
        const o = document.createElement('option');
        o.value = v.name;
        o.textContent = `${v.name} (${v.lang})${v.localService ? '' : ' · online'}`;
        o.selected = v.name === choice.voice;
        select.append(o);
      }
      select.addEventListener('change', () => {
        choice.voice = select.value;
        updateResult();
      });

      const slider = (label: string, key: 'pitch' | 'rate', min: number, max: number) => {
        const l = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'range';
        input.min = String(min);
        input.max = String(max);
        input.step = '0.05';
        input.value = String(choice[key]);
        const text = () => (l.firstChild!.textContent = `${label}: ${Number(input.value).toFixed(2)}`);
        l.append(document.createTextNode(''), input);
        text();
        input.addEventListener('input', () => {
          choice[key] = Number(input.value);
          text();
          updateResult();
        });
        return l;
      };

      const voiceLabel = document.createElement('label');
      voiceLabel.textContent = 'Voz';
      const quotes = document.createElement('ul');
      quotes.className = 'quotes';
      for (const q of QUOTES.filter((q) => q.speaker === s.id)) {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = 'voice-btn';
        btn.type = 'button';
        btn.textContent = '▶ Ouvir';
        btn.addEventListener('click', () => speak(q.text, choice));
        const span = document.createElement('span');
        span.textContent = `“${q.text}”`;
        const src = document.createElement('small');
        src.textContent = q.source;
        span.append(src);
        li.append(btn, span);
        quotes.append(li);
      }

      card.append(h, hint, voiceLabel, select, slider('Tom', 'pitch', 0.1, 2), slider('Velocidade', 'rate', 0.5, 1.8), quotes);
      return card;
    })
  );
  updateResult();
}

$('copy').addEventListener('click', async () => {
  const text = ($('result') as HTMLTextAreaElement).value;
  try {
    await navigator.clipboard.writeText(text);
    $('copy').textContent = 'Copiado!';
  } catch {
    ($('result') as HTMLTextAreaElement).select();
  }
});

render();
// as vozes chegam depois em vários navegadores
speechSynthesis?.addEventListener?.('voiceschanged', render);
