// Captura quadros de eventos e veículos (precisa do "npm run dev" na porta 5173).
// Uso: OUT=pasta node tools/capture-events.cjs fraldas apagao veiculo:lula veiculo:boulos ...
const { chromium } = require('playwright');
const ids = process.argv.slice(2);
const OUT = process.env.OUT || '/tmp/ev';
(async () => {
  const browser = await chromium.launch();
  for (const arg of ids) {
    const [kind, id] = arg.includes(':') ? arg.split(':') : ['evento', arg];
    const vehicle = kind === 'veiculo';
    const page = await browser.newPage({ viewport: { width: 360, height: 640 } });
    await page.goto('http://localhost:5173/teste.html?chave=piloto-do-jatinho');
    await page.waitForTimeout(1200);
    await page.evaluate(([id, vehicle]) => localStorage.setItem('jatinho-do-flavio:teste', JSON.stringify({
      enabled: true, stageLength: 40, startStage: 0, travelSeconds: 5, speed: 1, invincible: true, collection: false,
      chasers: vehicle ? [id] : ['lula'], events: !vehicle, event: id, eventInterval: 4, vehicles: vehicle })), [id, vehicle]);
    await page.goto('http://localhost:5173/jogar.html');
    await page.waitForTimeout(1500);
    await page.mouse.click(180, 300);
    const t0 = Date.now();
    let n = 0, lastFlap = 0;
    const start = vehicle ? 6500 : 3300;
    const dur = vehicle ? 14500 : 13500;
    while (Date.now() - t0 < dur) {
      const t = Date.now() - t0;
      if (t - lastFlap > 380) { await page.mouse.click(180, 300); lastFlap = t; }
      if (t > start) await page.locator('canvas').screenshot({ path: `${OUT}/${id}-${String(n++).padStart(3, '0')}.png` });
      await page.waitForTimeout(60);
    }
    console.log(arg, n);
    await page.close();
  }
  await browser.close();
})();
