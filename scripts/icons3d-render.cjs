// node scripts/icons3d-render.cjs <bundle.js> <out-dir>
// Screenshots each 3D service icon on a transparent background.
const puppeteer = require("puppeteer-core");
const fs = require("fs");

(async () => {
  const [bundle, out] = process.argv.slice(2);
  const code = fs.readFileSync(bundle, "utf8");
  const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
  const p = await b.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.setViewport({ width: 640, height: 640 });
  await p.setContent('<!doctype html><style>html,body{margin:0;background:transparent;overflow:hidden}canvas{display:block}</style><body></body>');
  await p.addScriptTag({ content: code });
  const shots = [];
  for (const k of ["ai", "software", "security", "cloud", "vision", "workshops", "integration", "office"]) {
    await p.evaluate((k) => window.renderIcon(k), k);
    await new Promise((r) => setTimeout(r, 300));
    await p.screenshot({ path: `${out}/icon-${k}.png`, omitBackground: true });
    shots.push(`${out}/icon-${k}.png`);
    console.log(k, errs.join("|") || "ok");
  }
  const q = await b.newPage();
  await q.setViewport({ width: 1750, height: 520 });
  await q.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(7,1fr)">${shots.map((f, i) => `<div style="background:${i % 2 ? "#f3f4f4" : "#1b1b1b"}"><img style="width:100%" src="data:image/png;base64,${fs.readFileSync(f).toString("base64")}"></div>`).join("")}</body>`);
  await q.screenshot({ path: out + "/icons-sheet.jpg", type: "jpeg", quality: 80 });
  await b.close();
})();
