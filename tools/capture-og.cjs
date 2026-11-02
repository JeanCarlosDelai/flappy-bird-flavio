// Gera public/og-image.png (1200x630). Precisa do "npm run dev" na porta 5173.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('http://localhost:5173/tools/og.html');
  await p.waitForSelector('body[data-ready="1"]');
  await p.locator('#og').screenshot({ path: 'public/og-image.png' });
  await b.close();
})();
