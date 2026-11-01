// Captura quadros dos eventos aleatórios (precisa do "npm run dev" na porta 5173). Uso: node tools/capture-events.cjs fraldas apagao ...
const { chromium } = require('playwright');
const ids = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  for (const id of ids) {
    const page = await browser.newPage({ viewport: { width: 360, height: 640 } });
    await page.goto('http://localhost:5173/teste.html');
    await page.evaluate((id) => localStorage.setItem('jatinho-do-flavio:teste', JSON.stringify({
      enabled: true, stageLength: 40, startStage: 0, travelSeconds: 5, speed: 1, invincible: true, collection: false,
      chasers: ['lula','xandao','janja','pf','renan','gonet','dino','interpol'], events: true, event: id, eventInterval: 4 })), id);
    await page.goto('http://localhost:5173/jogar.html');
    await page.waitForTimeout(1500);
    await page.mouse.click(180, 300); await page.waitForTimeout(300); await page.mouse.click(180, 300);
    let t0 = Date.now(), n = 0, lastFlap = 0;
    const dur = id === 'gravidade' || id === 'moedas' ? 11500 : 13500;
    while (Date.now() - t0 < dur) {
      const t = Date.now() - t0;
      const flapEvery = 380;
      if (t - lastFlap > flapEvery) { await page.mouse.click(180, 300); lastFlap = t; }
      if (t > 3300) await page.locator('canvas').screenshot({ path: `/tmp/ev/${id}-${String(n++).padStart(3,'0')}.png` });
      await page.waitForTimeout(60);
    }
    console.log(id, n);
    await page.close();
  }
  await browser.close();
})();
