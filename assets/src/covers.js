const { chromium } = require("playwright-core");
const { pathToFileURL } = require("url");
const path = require("path");
(async () => {
  const ids = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 1 });
  for (const id of ids) {
    await p.goto(pathToFileURL(path.resolve("cover.html")).href + "?id=" + id);
    await p.evaluate(() => window.ready);
    await p.waitForTimeout(200);
    await p.screenshot({ path: `out_covers/${id}.png` });
  }
  await b.close();
})();
