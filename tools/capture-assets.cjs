// Gera os PNGs de docs/assets/ a partir da folha de assets e das páginas reais.
// Uso: npm run dev (porta 5173) e, em outro terminal, `node tools/capture-assets.cjs [url-base]`.
const { chromium } = require('playwright');
const path = require('node:path');

const base = process.argv[2] ?? 'http://localhost:5173/';
const out = (name) => path.join(__dirname, '..', 'docs', 'assets', `${name}.png`);

(async () => {
  const browser = await chromium.launch();

  // 1) assets isolados
  const sheet = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await sheet.goto(base + 'tools/asset-sheet.html');
  await sheet.waitForSelector('figure[data-asset]');
  for (const fig of await sheet.$$('figure[data-asset]')) {
    const id = await fig.getAttribute('data-asset');
    await (await fig.$('canvas')).screenshot({ path: out(id) });
  }

  // 2) telas do jogo (celular)
  const phone = await browser.newPage({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
  await phone.goto(base + 'jogar.html');
  await phone.waitForTimeout(600);
  await phone.screenshot({ path: out('tela-menu') });
  await phone.mouse.click(195, 300);
  await phone.waitForTimeout(300);
  await phone.mouse.click(195, 300);
  let shotPlay = false;
  for (let i = 0; i < 80; i++) {
    if (await phone.locator('.go-overlay').count()) break;
    await phone.waitForTimeout(330);
    await phone.mouse.click(195, 300);
    if (i === 12 && !shotPlay) {
      await phone.screenshot({ path: out('tela-jogo') });
      await phone.keyboard.press('Escape');
      await phone.waitForTimeout(400);
      await phone.screenshot({ path: out('tela-pausa') });
      await phone.keyboard.press('Escape');
      shotPlay = true;
    }
  }
  await phone.waitForSelector('.go-overlay', { timeout: 60000 });
  await phone.waitForTimeout(900);
  await phone.screenshot({ path: out('tela-fim-de-jogo') });

  await phone.goto(base);
  await phone.waitForTimeout(800);
  await phone.screenshot({ path: out('site-landing-celular'), fullPage: true });
  await phone.goto(base + 'ranking.html');
  await phone.waitForTimeout(800);
  await phone.screenshot({ path: out('site-ranking-celular'), fullPage: true });

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktop.goto(base);
  await desktop.waitForTimeout(800);
  await desktop.screenshot({ path: out('site-landing-computador') });

  await browser.close();
})();
