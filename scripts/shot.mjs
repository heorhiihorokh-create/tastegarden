import puppeteer from 'puppeteer-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = '.shots';
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const locale = process.argv[2] || 'nl';

const targets = [
  { name: 'd', width: 1440, height: 900, mobile: false, dsf: 1 },
  { name: 'm', width: 402, height: 874, mobile: true, dsf: 2 },
];
const sections = ['concept', 'stations', 'dishes', 'formules', 'ambiance', 'practical', 'reservation'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

for (const t of targets) {
  const errors = [];
  // --- Motion pass: hero only (entrance + ember + parallax bg) ---
  const hero = await browser.newPage();
  hero.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  hero.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  await hero.setViewport({ width: t.width, height: t.height, isMobile: t.mobile, hasTouch: t.mobile, deviceScaleFactor: t.dsf });
  await hero.goto(`${BASE}/${locale}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(1600);
  await hero.screenshot({ path: `${OUT}/${t.name}_hero.png` });
  await hero.evaluate(() => {
    const station = document.getElementById('stations');
    if (station) {
      window.scrollTo({
        top: station.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.72,
        behavior: 'instant',
      });
    }
  });
  await sleep(900);
  await hero.screenshot({ path: `${OUT}/${t.name}_stations_motion.png` });
  // open the slide menu (burger exists on mobile/tablet only)
  const burger = await hero.$('button[aria-controls="main-menu"]');
  const visible = burger && (await burger.boundingBox());
  if (visible) {
    await burger.click();
    await sleep(900);
    await hero.screenshot({ path: `${OUT}/${t.name}_menu.png` });
  }
  await hero.close();

  // --- Reduced-motion pass: all content visible, native scroll, count-ups final ---
  const page = await browser.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  await page.setViewport({ width: t.width, height: t.height, isMobile: t.mobile, hasTouch: t.mobile, deviceScaleFactor: t.dsf });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`${BASE}/${locale}`, { waitUntil: 'networkidle2', timeout: 60000 });
  // gentle scroll to force any lazy images to load
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await sleep(900);

  for (const id of sections) {
    const found = await page.evaluate((sid) => {
      const el = document.getElementById(sid);
      if (!el) return false;
      el.scrollIntoView({ block: 'start' });
      return true;
    }, id);
    if (!found) continue;
    await sleep(450);
    await page.screenshot({ path: `${OUT}/${t.name}_${id}.png` });
    if (id === 'stations') {
      const stations = await page.$('#stations');
      if (stations) {
        await stations.screenshot({ path: `${OUT}/${t.name}_stations_full.png` });
      }
    }
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  await page.screenshot({ path: `${OUT}/${t.name}_footer.png` });
  await page.close();
  if (errors.length) {
    console.error(`${t.name} errors:\n${errors.join('\n')}`);
    process.exitCode = 1;
  }
  console.log(`done ${t.name}`);
}

await browser.close();
console.log('all done');
