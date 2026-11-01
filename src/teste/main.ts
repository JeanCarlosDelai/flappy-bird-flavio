import '@/pwa';
import '../landing/style.css';
import '../ranking/style.css';
import './style.css';
import { CHASERS } from '@/entities/chaser';
import { STAGES } from '@/render/stages';
import { TEST_DEFAULTS, loadTestSettings, saveTestSettings, type TestSettings } from '@/systems/test-mode';

/** MODO TESTE: página de configuração (temporária). */
const form = document.getElementById('form') as HTMLFormElement;
const field = <T extends HTMLElement>(name: string) => form.elements.namedItem(name) as unknown as T;
const chasersBox = document.getElementById('chasers')!;

// parada de cada perseguidor, para mostrar ao lado do nome
const stopOf = (id: string) =>
  STAGES.filter((s) => (s.chasers as string[]).includes(id))
    .map((s) => s.name)
    .slice(0, 2)
    .join(', ');

for (const c of CHASERS) {
  const label = document.createElement('label');
  label.innerHTML = `<input type="checkbox" name="chaser" value="${c.id}" /> <span></span>`;
  label.querySelector('span')!.innerHTML = `${c.name} <small></small>`;
  label.querySelector('small')!.textContent = stopOf(c.id);
  chasersBox.append(label);
}

function fill(s: TestSettings): void {
  field<HTMLInputElement>('enabled').checked = s.enabled;
  field<HTMLInputElement>('stageLength').value = String(s.stageLength);
  field<HTMLSelectElement>('startStage').value = String(s.startStage);
  field<HTMLInputElement>('travelSeconds').value = String(s.travelSeconds);
  field<HTMLInputElement>('speed').value = String(s.speed);
  field<HTMLInputElement>('invincible').checked = s.invincible;
  field<HTMLInputElement>('collection').checked = s.collection;
  form.querySelectorAll<HTMLInputElement>('input[name=chaser]').forEach((i) => (i.checked = s.chasers.includes(i.value as never)));
  outputs();
}

function outputs(): void {
  field<HTMLOutputElement>('stageLengthOut').value = `${field<HTMLInputElement>('stageLength').value} pontos`;
  field<HTMLOutputElement>('travelOut').value = `${field<HTMLInputElement>('travelSeconds').value} s`;
  field<HTMLOutputElement>('speedOut').value = `${Number(field<HTMLInputElement>('speed').value).toFixed(2)}x`;
}

function read(): TestSettings {
  return {
    enabled: field<HTMLInputElement>('enabled').checked,
    stageLength: Number(field<HTMLInputElement>('stageLength').value),
    startStage: Number(field<HTMLSelectElement>('startStage').value),
    travelSeconds: Number(field<HTMLInputElement>('travelSeconds').value),
    speed: Number(field<HTMLInputElement>('speed').value),
    invincible: field<HTMLInputElement>('invincible').checked,
    collection: field<HTMLInputElement>('collection').checked,
    chasers: [...form.querySelectorAll<HTMLInputElement>('input[name=chaser]:checked')].map((i) => i.value) as TestSettings['chasers']
  };
}

function persist(): void {
  outputs();
  const s = read();
  if (!s.chasers.length) {
    document.getElementById('saved')!.textContent = 'Marque pelo menos um perseguidor.';
    return;
  }
  saveTestSettings(s);
  document.getElementById('saved')!.textContent = s.enabled
    ? `Salvo. Modo teste LIGADO: ${s.stageLength} pontos por parada, começando em ${STAGES[s.startStage].name}.`
    : 'Salvo. Modo teste desligado (jogo normal).';
}

form.addEventListener('input', persist);
form.addEventListener('change', persist);
document.getElementById('reset')!.addEventListener('click', () => {
  fill({ ...TEST_DEFAULTS });
  persist();
});

fill(loadTestSettings());
