// Gera MP3s das músicas e efeitos em docs/audio/ (precisa de npm run dev e ffmpeg).
// Uso: node tools/capture-audio.cjs [url-base]
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const base = process.argv[2] ?? 'http://localhost:5173/';
const outDir = path.join(__dirname, '..', 'docs', 'audio');
fs.mkdirSync(outDir, { recursive: true });

function save(name, b64) {
  const wav = path.join(require('node:os').tmpdir(), `${name}.wav`);
  fs.writeFileSync(wav, Buffer.from(b64, 'base64'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wav, '-b:a', '128k', path.join(outDir, `${name}.mp3`)]);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(base + 'tools/render-audio.html');
  await page.waitForSelector('body[data-ready="1"]');
  const tracks = [['01-musica-menu', 'menu'], ['02-musica-brasilia', 'brasilia'], ['03-musica-litoral', 'litoral'], ['04-musica-oceano', 'oceano'], ['05-musica-fronteira', 'fronteira']];
  for (const [file, name] of tracks) save(file, await page.evaluate((n) => window.renderTrack(n, 2), name));
  save('06-efeitos', await page.evaluate(() => window.renderSfx()));
  console.log('efeitos em ordem:', await page.evaluate(() => window.sfxNames.join(', ')));
  await browser.close();
})();
