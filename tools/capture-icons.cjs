// Gera os ícones do PWA em public/icons/ (precisa do npm run dev rodando).
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');
const out = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 1800 } });
  await p.goto((process.argv[2] ?? 'http://localhost:5173/') + 'tools/icons.html');
  await p.waitForTimeout(1500);
  await p.waitForSelector('body[data-ready="1"]');
  for (const c of await p.$$('canvas[data-icon]')) {
    const id = await c.getAttribute('data-icon');
    const data = await c.evaluate((el) => el.toDataURL('image/png'));
    fs.writeFileSync(path.join(out, `${id}.png`), Buffer.from(data.split(',')[1], 'base64'));
  }
  console.log(fs.readdirSync(out).join(', '));
  await b.close();
})();
