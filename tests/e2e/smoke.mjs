// Testes de ponta a ponta (smoke): abre o site compilado como no ar e confere páginas e uma partida.
// Uso: npm run test:e2e   (compila, sobe o "vite preview" e roda os testes no Chromium)
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 4179;
const BASE = `http://localhost:${PORT}`;
const results = [];
const errors = [];

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe' });
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('vite preview não subiu')), 20000);
  server.stdout.on('data', (d) => d.toString().includes(String(PORT)) && (clearTimeout(timer), resolve()));
});

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

async function test(name, fn) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('response', (r) => r.status() >= 400 && !r.url().includes('/api/') && !r.url().includes('/_vercel/') && pageErrors.push(`${r.status()} ${r.url()}`));
  try {
    await fn(page);
    if (pageErrors.length) throw new Error(`erros na página: ${pageErrors.join(' | ')}`);
    results.push(['✅', name]);
  } catch (e) {
    results.push(['❌', name, e.message]);
    errors.push(name);
  } finally {
    await page.close();
  }
}
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const fresh = async (page, path) => {
  await page.goto(`${BASE}/${path}`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/${path}`);
  await page.waitForTimeout(600);
};

await test('landing abre com link para jogar', async (page) => {
  await fresh(page, '');
  expect(await page.locator('a[href*="jogar"]').count() > 0, 'sem link para jogar');
});

await test('menu: Modos, Mais e versão; Modo teste escondido', async (page) => {
  await fresh(page, 'jogar.html');
  expect(await page.locator('.menu-links >> text=Modos').isVisible(), 'sem botão Modos');
  expect(await page.locator('.menu-links >> text=Mais').isVisible(), 'sem botão Mais');
  expect(/^v\d+\.\d+\.\d+/.test((await page.locator('.menu-links .credits').textContent()) ?? ''), 'sem versão');
  await page.click('.menu-links >> text=Mais');
  expect(await page.locator('.sheet-item >> text=Ranking').isVisible(), 'Mais sem Ranking');
  expect((await page.locator('.sheet-item >> text=Modo teste').count()) === 0, 'Modo teste aparece para o público');
});

await test('primeira partida: introdução, depois jogo até o fim e jogar de novo', async (page) => {
  await fresh(page, 'jogar.html');
  await page.mouse.click(195, 300); // começa: introdução
  await page.waitForTimeout(900);
  expect((await page.evaluate(() => localStorage.getItem('jatinho-do-flavio:intro'))) === null, 'introdução não apareceu');
  await page.mouse.click(195, 300); // pula a introdução
  await page.waitForTimeout(300);
  expect((await page.evaluate(() => localStorage.getItem('jatinho-do-flavio:intro'))) === '1', 'pular não marcou a introdução');
  // sem tocar o jatinho cai: fim de jogo
  await page.mouse.click(195, 300);
  await page.waitForSelector('.go-overlay', { timeout: 15000 });
  expect(await page.locator('.go-title').isVisible(), 'sem título no fim de jogo');
  await page.click('.go-sticky .go-btn');
  await page.waitForTimeout(400);
  expect((await page.locator('.go-overlay').count()) === 0, 'jogar de novo não fechou o painel');
});

await test('modo hardcore pelo painel Modos', async (page) => {
  await fresh(page, 'jogar.html');
  await page.evaluate(() => localStorage.setItem('jatinho-do-flavio:intro', '1'));
  await page.click('.menu-links >> text=Modos');
  await page.click('.sheet-item >> text=Hardcore');
  await page.mouse.click(195, 300);
  await page.waitForSelector('.go-overlay', { timeout: 15000 });
  expect(((await page.locator('.go-kicker').textContent()) ?? '').includes('hardcore'), 'painel não diz hardcore');
});

await test('Coleção: sanfonas abrem e mostram cartões', async (page) => {
  await fresh(page, 'colecao.html');
  expect((await page.locator('details.dex-acc').count()) >= 9, 'faltam seções');
  await page.click('details.dex-acc >> nth=0 >> summary');
  await page.waitForTimeout(300);
  expect((await page.locator('.dex-card').count()) > 10, 'seção aberta sem cartões');
});

await test('Hangar: jatinhos à venda e skin secreta escondida', async (page) => {
  await fresh(page, 'hangar.html');
  expect((await page.locator('.skin-card').count()) >= 20, 'poucos jatinhos');
  expect((await page.locator('.skin-card >> text=ninja').count()) === 0, 'skin secreta aparecendo');
});

await test('Sobre e fontes: todas as falas com áudio que existe', async (page) => {
  await fresh(page, 'sobre.html');
  const srcs = await page.locator('.voice-card audio').evaluateAll((els) => els.map((e) => e.src));
  expect(srcs.length >= 11, `só ${srcs.length} falas`);
  for (const src of srcs) {
    const r = await page.request.get(src);
    expect(r.ok(), `áudio faltando: ${src}`);
  }
});

await test('Passaporte e Ranking abrem', async (page) => {
  await fresh(page, 'passaporte.html');
  expect((await page.locator('.stamp').count()) === 4, 'carimbos faltando');
  await page.goto(`${BASE}/ranking.html`);
  await page.waitForTimeout(600);
  expect(await page.locator('h1').count() > 0, 'ranking sem título');
});

await test('Modo teste: restrito sem a chave', async (page) => {
  await fresh(page, 'teste.html');
  expect(await page.locator('#restrito').isVisible(), 'aviso de restrito não aparece');
  expect(!(await page.locator('#form').isVisible()), 'formulário visível sem a chave');
});

await browser.close();
server.kill();
for (const [ok, name, msg] of results) console.log(`${ok} ${name}${msg ? `\n   → ${msg}` : ''}`);
console.log(`\n${results.length - errors.length} de ${results.length} passaram`);
process.exit(errors.length ? 1 : 0);
