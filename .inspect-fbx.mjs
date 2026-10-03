// Inspect an FBX with three's loader in Node: meshes, tris, skeleton, clips, textures.
import fs from "node:fs";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
const texSrcs = [];
globalThis.self = globalThis; globalThis.window = globalThis;
globalThis.document = { createElementNS: () => ({ addEventListener() {}, removeEventListener() {}, set src(v) { texSrcs.push(String(v).slice(0, 60) + ` …(${String(v).length} chars)`); } }) };
globalThis.URL.createObjectURL ??= () => "blob:x";
const buf = fs.readFileSync(process.argv[2]);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const t0 = Date.now();
const group = new FBXLoader().parse(ab, "");
console.log("parsed in", Date.now() - t0, "ms");
let meshes = 0, skinned = 0, tris = 0, verts = 0; const mats = new Map(); const bones = new Set();
group.traverse((o) => {
  if (o.isMesh) {
    meshes++; if (o.isSkinnedMesh) skinned++;
    const g = o.geometry; const n = g.index ? g.index.count : g.attributes.position.count; tris += n / 3; verts += g.attributes.position.count;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) { const k = m.name || m.uuid; const maps = ["map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap","specularMap"].filter(x => m[x]).join(","); mats.set(k, { type: m.type, maps, color: m.color?.getHexString(), skinning: !!o.isSkinnedMesh }); }
    console.log(" mesh:", o.name, "| tris", Math.round(n / 3), "| verts", g.attributes.position.count, "| attrs", Object.keys(g.attributes).join(","), "| skinned", !!o.isSkinnedMesh, o.skeleton ? "bones " + o.skeleton.bones.length : "");
  }
  if (o.isBone) bones.add(o.name);
});
console.log("meshes", meshes, "skinned", skinned, "tris", Math.round(tris), "verts", verts);
console.log("materials:", [...mats.entries()].map(([k, v]) => `${k} ${v.type} color#${v.color} maps[${v.maps}]`).join("\n  "));
console.log("bones", bones.size, [...bones].slice(0, 12).join(", "), bones.size > 12 ? "…" : "");
console.log("animations", group.animations.length, group.animations.map(a => `${a.name} ${a.duration.toFixed(2)}s tracks ${a.tracks.length}`).join(" | "));
const box = new THREE.Box3().setFromObject(group); const size = new THREE.Vector3(); box.getSize(size);
console.log("bbox size", size.x.toFixed(1), size.y.toFixed(1), size.z.toFixed(1), "min y", box.min.y.toFixed(1), "max y", box.max.y.toFixed(1), "root scale", group.scale.x);
console.log("texture loads requested:", texSrcs.length); texSrcs.slice(0, 10).forEach(s => console.log("  ", s));
