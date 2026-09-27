// Walkable-space grid for the office. Furniture registers its footprint as it
// is placed; paths are A* over 8-connected cells (no corner cutting) and then
// pulled straight wherever there is a clear line of sight, so people walk in
// natural diagonals down the aisles instead of staircase steps.

export class NavGrid {
  constructor(x0, z0, x1, z1, cell = 0.25) {
    this.x0 = x0;
    this.z0 = z0;
    this.cell = cell;
    this.w = Math.ceil((x1 - x0) / cell);
    this.h = Math.ceil((z1 - z0) / cell);
    this.blocked = new Uint8Array(this.w * this.h);
  }
  toCell(x, z) {
    return [Math.floor((x - this.x0) / this.cell), Math.floor((z - this.z0) / this.cell)];
  }
  toWorld(cx, cz) {
    return [this.x0 + (cx + 0.5) * this.cell, this.z0 + (cz + 0.5) * this.cell];
  }
  inside(cx, cz) {
    return cx >= 0 && cz >= 0 && cx < this.w && cz < this.h;
  }
  isFree(cx, cz) {
    return this.inside(cx, cz) && !this.blocked[cz * this.w + cx];
  }
  freeAt(x, z) {
    const [cx, cz] = this.toCell(x, z);
    return this.isFree(cx, cz);
  }
  /** Block a world-space rectangle, grown by `margin` (half a body width). */
  block(x0, z0, x1, z1, margin = 0.28) {
    const [ax, az] = this.toCell(Math.min(x0, x1) - margin, Math.min(z0, z1) - margin);
    const [bx, bz] = this.toCell(Math.max(x0, x1) + margin, Math.max(z0, z1) + margin);
    for (let cz = Math.max(0, az); cz <= Math.min(this.h - 1, bz); cz++)
      for (let cx = Math.max(0, ax); cx <= Math.min(this.w - 1, bx); cx++) this.blocked[cz * this.w + cx] = 1;
  }
  /** Block a rectangle centred at (x, z) with size (w, d), rotated by yaw. */
  blockBox(x, z, w, d, yaw = 0, margin = 0.28) {
    const c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw));
    const hw = (w * c + d * s) / 2, hd = (w * s + d * c) / 2;
    this.block(x - hw, z - hd, x + hw, z + hd, margin);
  }
  blockCircle(x, z, r, margin = 0.28) {
    this.block(x - r, z - r, x + r, z + r, margin);
  }
  /** Force a cell free (a standing spot squeezed between desk and chair). */
  clear(x, z, r = 0.2) {
    const [ax, az] = this.toCell(x - r, z - r);
    const [bx, bz] = this.toCell(x + r, z + r);
    for (let cz = Math.max(0, az); cz <= Math.min(this.h - 1, bz); cz++)
      for (let cx = Math.max(0, ax); cx <= Math.min(this.w - 1, bx); cx++) this.blocked[cz * this.w + cx] = 0;
  }
  /** Nearest free cell centre to a world point (spiral search). */
  nearestFree(x, z) {
    const [cx, cz] = this.toCell(x, z);
    if (this.isFree(cx, cz)) return [x, z];
    for (let r = 1; r < 12; r++)
      for (let dz = -r; dz <= r; dz++)
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
          if (this.isFree(cx + dx, cz + dz)) return this.toWorld(cx + dx, cz + dz);
        }
    return [x, z];
  }
  /** True when the straight segment between two world points crosses no blocked cell. */
  lineFree(ax, az, bx, bz) {
    const d = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.ceil(d / (this.cell * 0.5)));
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (!this.freeAt(ax + (bx - ax) * t, az + (bz - az) * t)) return false;
    }
    return true;
  }
  /** World-space path from (ax, az) to (bx, bz), ending exactly at the goal.
   *  A seat or a spot squeezed between furniture may sit in a blocked cell: the
   *  route then runs to the nearest free cell and finishes with a short
   *  straight approach, never a long line through walls. */
  findPath(ax, az, bx, bz) {
    const [fsx, fsz] = this.nearestFree(ax, az);
    const [fgx, fgz] = this.nearestFree(bx, bz);
    const inner = this.pathBetween(fsx, fsz, fgx, fgz);
    if (Math.hypot(fgx - bx, fgz - bz) > 0.02) inner.push([bx, bz]);
    return inner;
  }
  pathBetween(ax, az, bx, bz) {
    const [sx, sz] = this.toCell(ax, az);
    const [gx, gz] = this.toCell(bx, bz);
    if (!this.inside(sx, sz) || !this.inside(gx, gz)) return [[bx, bz]];
    const W = this.w, H = this.h;
    const start = sz * W + sx, goal = gz * W + gx;
    const gScore = new Float32Array(W * H).fill(Infinity);
    const prev = new Int32Array(W * H).fill(-1);
    const closed = new Uint8Array(W * H);
    const open = [start];
    gScore[start] = 0;
    const hf = (i) => {
      const x = i % W, z = (i / W) | 0;
      const dx = Math.abs(x - gx), dz = Math.abs(z - gz);
      return Math.max(dx, dz) + 0.414 * Math.min(dx, dz);
    };
    let found = false;
    while (open.length) {
      // smallest f (grid is tiny, a linear scan is fine)
      let bi = 0, bf = Infinity;
      for (let i = 0; i < open.length; i++) {
        const f = gScore[open[i]] + hf(open[i]);
        if (f < bf) {
          bf = f;
          bi = i;
        }
      }
      const cur = open[bi];
      open[bi] = open[open.length - 1];
      open.pop();
      if (cur === goal) {
        found = true;
        break;
      }
      closed[cur] = 1;
      const cx = cur % W, cz = (cur / W) | 0;
      for (let dz = -1; dz <= 1; dz++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dz) continue;
          const nx = cx + dx, nz = cz + dz;
          const ni = nz * W + nx;
          const goalCell = ni === goal;
          if (!this.inside(nx, nz) || closed[ni]) continue;
          if (!goalCell && this.blocked[ni]) continue;
          // no cutting corners around blocked cells
          if (dx && dz && (this.blocked[cz * W + nx] || this.blocked[nz * W + cx])) continue;
          const ng = gScore[cur] + (dx && dz ? 1.414 : 1);
          if (ng < gScore[ni]) {
            gScore[ni] = ng;
            prev[ni] = cur;
            if (!open.includes(ni)) open.push(ni);
          }
        }
    }
    if (!found) return [[bx, bz]];
    const cells = [];
    for (let c = goal; c !== -1 && c !== start; c = prev[c]) cells.unshift(c);
    const pts = cells.map((c) => this.toWorld(c % W, (c / W) | 0));
    pts[pts.length - 1] = [bx, bz];
    // string-pull: keep only the corners that need turning
    const out = [];
    let fromX = ax, fromZ = az, i = 0;
    while (i < pts.length) {
      let j = pts.length - 1;
      while (j > i && !this.lineFree(fromX, fromZ, pts[j][0], pts[j][1])) j--;
      out.push(pts[j]);
      fromX = pts[j][0];
      fromZ = pts[j][1];
      i = j + 1;
    }
    return out;
  }
}
