/* =========================================================
   scripts/screenshots.mjs
   Regenera las previews de los proyectos del portfolio.

   - Local:  node scripts/screenshots.mjs      (usa el Chrome instalado)
   - CI:     lo ejecuta .github/workflows/screenshots.yml

   Cada sitio se abre en un viewport de escritorio, se espera a que la
   red quede inactiva y a que terminen las animaciones de entrada, y se
   guarda un PNG en assets/img/<slug>.png. Si el PNG no cambia respecto
   al que ya está en git, no se hace commit.

   Config por sitio:
     settle     ms de espera tras cargar (para animaciones de entrada)
     unlock     true  -> sitio con intro "scroll-jacking": empujamos la
                          rueda del ratón para pasar la animación
     scrollFrac 0..1   -> tras desbloquear, deja la página a esa fracción
                          de su alto y captura ahí (útil para intros que
                          no se pueden saltar del todo)
   ========================================================= */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

// Acepta tanto `playwright` (CI) como `playwright-core` (local, más ligero).
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  ({ chromium } = await import('playwright-core'));
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'assets', 'img');
mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORT = { width: 1280, height: 800 };
const SCALE = 1.5; // nitidez en pantallas retina sin archivos enormes
const JPEG_QUALITY = 80; // las previews se guardan como .jpg (ligeras)

const SITES = [
  { slug: 'jenny-spa',            url: 'https://jenny-spa-web.vercel.app/',          settle: 9000 },
  { slug: 'tierra-sana',          url: 'https://tierra-sana.vercel.app/',            settle: 6000 },
  { slug: 'mirandas-barber-shop', url: 'https://mirandas-barber-shop.vercel.app/',   settle: 5000 },
  { slug: 'le-gouter',            url: 'https://le-gouter-cafe.vercel.app/',          settle: 4000, unlock: true, scrollFrac: 0.17 },
  { slug: 'galu-papeleria',       url: 'https://galu-papeleria.vercel.app/',          settle: 7000 },
  { slug: 'trapillo-shop',        url: 'https://trapillo-shop.vercel.app/',           settle: 3500, unlock: true, scrollFrac: 0.13 },
  { slug: 'esco-pq',              url: 'https://www.esco-pq.com/',                    settle: 4000 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function capture(context, site) {
  const page = await context.newPage();
  try {
    await page.goto(site.url, { waitUntil: 'load', timeout: 60000 });
    try {
      await page.waitForLoadState('networkidle', { timeout: 20000 });
    } catch {
      /* algunas páginas nunca quedan 100% idle */
    }

    await sleep(site.settle ?? 4000);

    if (site.unlock) {
      for (let i = 0; i < 14; i++) {
        await page.mouse.wheel(0, 850);
        await sleep(280);
      }
      await sleep(1800);
    }

    if (typeof site.scrollFrac === 'number') {
      await page.evaluate((frac) => {
        const h = document.body.scrollHeight - window.innerHeight;
        window.scrollTo({ top: Math.round(h * frac), behavior: 'instant' });
      }, site.scrollFrac);
      await sleep(2200);
    } else {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await sleep(400);
    }

    // Congela animaciones en bucle para un PNG estable.
    await page
      .addStyleTag({
        content:
          '*,*::before,*::after{animation-play-state:paused!important;transition:none!important}',
      })
      .catch(() => {});
    await sleep(300);

    await page.screenshot({
      path: join(OUT_DIR, `${site.slug}.jpg`),
      type: 'jpeg',
      quality: JPEG_QUALITY,
      clip: { x: 0, y: 0, ...VIEWPORT },
    });
    console.log(`ok   ${site.slug}`);
  } catch (err) {
    console.error(`FAIL ${site.slug}: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await page.close();
  }
}

const launchOpts = { headless: true };
// En local: Chrome del sistema. En CI: el chromium que instala Playwright.
if (!process.env.CI) launchOpts.channel = 'chrome';

const browser = await chromium.launch(launchOpts);
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: SCALE,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0 Safari/537.36 PortfolioShotBot/1.0',
});

for (const site of SITES) {
  // eslint-disable-next-line no-await-in-loop
  await capture(context, site);
}

await browser.close();
console.log('listo');
