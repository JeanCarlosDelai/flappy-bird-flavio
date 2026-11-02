import '@/pwa';
import '../landing/style.css';
import '../ranking/style.css';
import '../colecao/style.css';
import './style.css';
import { jetSprite } from '@/entities/jet';
import { SKINS } from '@/entities/skins';
import { buySkin, equipSkin, loadProgress } from '@/systems/progress';
import { tapCounter, toast, unlockSecret } from '@/systems/secrets';

// segredo: tocar 10 vezes no Flávio na janela
const tapJanela = tapCounter(10, () => {
  if (unlockSecret('janela', (p) => (p.skins = [...new Set([...p.skins, 'flavio-ninja'])]))) {
    toast('🥷 Segredo! Skin "Flávio ninja" liberada · Conquista secreta: Toc toc, Flávio?');
    render();
  }
});

/** Hangar: comprar e equipar skins do jatinho com moedas. */
const previews: { canvas: HTMLCanvasElement; id: string }[] = [];

function render(): void {
  const p = loadProgress();
  const visible = SKINS.filter((sk) => !sk.secret || p.skins.includes(sk.id));
  document.getElementById('wallet')!.innerHTML = `<b>🪙 ${p.coins}</b> moedas · ${p.skins.length} de ${visible.length} jatinhos`;
  const grid = document.getElementById('skins')!;
  previews.length = 0;
  grid.replaceChildren(
    ...visible.map((skin) => {
      const owned = p.skins.includes(skin.id);
      const equipped = p.skin === skin.id;
      const card = document.createElement('article');
      card.className = `skin-card${equipped ? ' equipped' : ''}`;
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 40;
      previews.push({ canvas, id: skin.id });
      if (skin.id === 'flavio-janela') canvas.addEventListener('click', () => tapJanela());
      const title = document.createElement('h3');
      title.textContent = skin.name;
      const desc = document.createElement('p');
      desc.textContent = skin.description;
      const price = document.createElement('span');
      price.className = 'price';
      price.textContent = owned ? (equipped ? '✓ Equipado' : 'Seu') : `🪙 ${skin.price}`;
      const button = document.createElement('button');
      button.type = 'button';
      if (equipped) {
        button.textContent = 'Usando';
        button.disabled = true;
      } else if (owned) {
        button.textContent = 'Usar';
        button.addEventListener('click', () => {
          equipSkin(skin.id);
          render();
        });
      } else {
        button.textContent = p.coins >= skin.price ? `Comprar` : `Faltam ${skin.price - p.coins}`;
        button.disabled = p.coins < skin.price;
        button.addEventListener('click', () => {
          if (buySkin(skin.id, skin.price)) render();
        });
      }
      card.append(canvas, title, desc, price, button);
      return card;
    })
  );
}

// chama/hélice/luzes animadas nas prévias
let frame = 0;
setInterval(() => {
  frame ^= 1;
  for (const { canvas, id } of previews) {
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sprite = jetSprite(0, frame, id);
    ctx.drawImage(sprite, Math.round((canvas.width - sprite.width) / 2), Math.round((canvas.height - sprite.height) / 2));
  }
}, 150);

render();
