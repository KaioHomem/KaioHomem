// Renders the README images from banner.html / cta.html with headless Chromium.
// banner.html reads the monogram frames from ./cgi/ (copy of KaioHomem.github.io/site/public/cgi).
// usage: node render.js <page.html> <outDir> <scale> [still t] | [anim]
// anim frames -> webp: ffmpeg -framerate 24 -i f_%04d.png -c:v libwebp_anim -quality 80 -loop 0 banner.webp
const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");

(async () => {
  const [page_, out, scale = "1", mode = "anim", tArg] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: Number(scale) });
  const page = await ctx.newPage();
  await page.goto("file:///" + path.resolve(page_).replace(/\\/g, "/"));
  const vp = await page.evaluate(() => ({ width: document.body.scrollWidth, height: document.body.scrollHeight }));
  await page.setViewportSize(vp);
  await page.evaluate(() => window.ready);
  if (mode === "still") {
    await page.evaluate((t) => window.setTime && window.setTime(t), Number(tArg || 0));
    await page.screenshot({ path: path.join(out, "still.png"), omitBackground: true });
  } else {
    const n = Math.round(6.5 * 24);
    for (let i = 0; i < n; i++) {
      await page.evaluate((t) => window.setTime(t), i / 24);
      await page.screenshot({ path: path.join(out, `f_${String(i).padStart(4, "0")}.png`) });
    }
  }
  await browser.close();
})();
