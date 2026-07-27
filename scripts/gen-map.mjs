/* Dotted land grid for ClientMap, sampled from Natural Earth land polygons
   (world-atlas 50m) so the coastlines are real.
   Run offline when the map window or density changes:
       npm i --no-save world-atlas topojson-client && node scripts/gen-map.mjs
   It rewrites lib/map/land.ts, which is what ships — neither package is a
   runtime dependency. */
import { writeFileSync, readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { feature } = require('topojson-client');

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-50m.json', import.meta.url), 'utf8'));
const land = feature(topo, topo.objects.land);

const WIN = { lon0: -128, lon1: 26, lat0: -16, lat1: 66 };
const STEP = 1.4;
const W = 1000;
const H = Math.round((W * (WIN.lat1 - WIN.lat0)) / (WIN.lon1 - WIN.lon0));

const inRing = (x, y, ring) => {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};
// polygon = [outer, ...holes]
const inPoly = (x, y, poly) =>
  inRing(x, y, poly[0]) && !poly.slice(1).some((h) => inRing(x, y, h));

// flatten to polygons, keeping only those whose bbox meets the window
const polys = [];
for (const f of land.features ?? [land]) {
  const g = f.geometry ?? f;
  const list = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const poly of list) {
    let minX = 180, maxX = -180, minY = 90, maxY = -90;
    for (const [x, y] of poly[0]) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    if (maxX < WIN.lon0 || minX > WIN.lon1 || maxY < WIN.lat0 || minY > WIN.lat1) continue;
    polys.push({ poly, minX, maxX, minY, maxY });
  }
}

const dots = [];
for (let lat = WIN.lat1; lat >= WIN.lat0; lat -= STEP) {
  for (let lon = WIN.lon0; lon <= WIN.lon1; lon += STEP) {
    const hit = polys.some(
      (p) =>
        lon >= p.minX && lon <= p.maxX && lat >= p.minY && lat <= p.maxY &&
        inPoly(lon, lat, p.poly)
    );
    if (!hit) continue;
    const x = ((lon - WIN.lon0) / (WIN.lon1 - WIN.lon0)) * W;
    const y = ((WIN.lat1 - lat) / (WIN.lat1 - WIN.lat0)) * H;
    // integers: dot spacing is ~7px, so the rounding is invisible and the
    // path string is a third smaller
    dots.push([Math.round(x), Math.round(y)]);
  }
}

// one path of zero-length segments — with round caps each renders as a dot,
// so the whole basemap is a single DOM node instead of thousands of <circle>s
const packed = dots.map(([x, y]) => `M${x} ${y}h.01`).join('');
const out = `/* Generated from Natural Earth land polygons (world-atlas 50m), sampled on a
   ${STEP}° grid over lon ${WIN.lon0}..${WIN.lon1}, lat ${WIN.lat0}..${WIN.lat1} (equirectangular).
   Regenerate with scripts/gen-map.mjs; nothing here is loaded at runtime. */
export const MAP_VIEW = { lon0: ${WIN.lon0}, lon1: ${WIN.lon1}, lat0: ${WIN.lat0}, lat1: ${WIN.lat1}, w: ${W}, h: ${H} };

/** Single path; render with stroke-linecap="round" and a stroke-width that
    sets the dot size. ${dots.length} dots in the ${W}×${H} viewBox. */
export const LAND_PATH = "${packed}";
`;
writeFileSync(new URL('../lib/map/land.ts', import.meta.url), out);
console.log('dots:', dots.length, 'viewBox:', W, H, 'kb:', Math.round(out.length / 1024));
