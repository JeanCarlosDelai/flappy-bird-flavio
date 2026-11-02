// Equilíbrio: robô joga cada parada acelerado e mede batidas por origem.
// Uso: npm run dev (porta 5173) e depois: node tools/balance.cjs [segundos por parada] [repetições]
const { chromium } = require('playwright');
const SECONDS = Number(process.argv[2] || 600);
const REPEAT = Number(process.argv[3] || 2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const total = {};
  for (const [name, pts] of [['brasilia', 0], ['iguazu', 40], ['guayaquil', 80], ['miami', 120]]) {
    const agg = { hits: {}, launched: {}, passed: {}, seconds: 0 };
    for (let r = 0; r < REPEAT; r++) {
      await p.goto(`http://localhost:5173/jogar.html?bot&pontos=${pts}`);
      await p.waitForTimeout(800);
      await p.evaluate(() => localStorage.clear());
      await p.evaluate(() => window.__play());
      for (let t = 0; t < SECONDS; t += 30) await p.evaluate(() => window.__fast(30));
      const res = await p.evaluate(() => window.__balance());
      for (const k of ['hits', 'launched', 'passed']) for (const [key, v] of Object.entries(res[k])) agg[k][key] = (agg[k][key] || 0) + v;
      agg.seconds += res.seconds;
    }
    total[name] = agg;
  }
  console.log(JSON.stringify(total));
  await b.close();
})();
