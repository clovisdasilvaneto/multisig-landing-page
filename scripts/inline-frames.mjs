// Builds a single self-contained HTML preview (dist-single/lockstep.html):
// all frames + stills are embedded as data URIs, so the page works with no
// static file server (e.g. for a hosted preview or sharing as one file).
// Uses a lighter 1280w frame set to stay well under ~16 MB.
// Run via: npm run build:single   (requires ffmpeg)
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const SRC = "assets/generated_video.mp4";
const TMP = ".preview-frames";
const OUT = "dist-single";

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
execSync(`ffmpeg -y -v error -i ${SRC} -vf "scale=1280:-2:flags=lanczos" -c:v libwebp -quality 52 ${TMP}/f_%04d.webp`);

const assets = {};
const uri = (buf, mime) => `data:${mime};base64,${buf.toString("base64")}`;

for (const f of readdirSync(TMP).sort()) {
  const data = uri(readFileSync(join(TMP, f)), "image/webp");
  for (const set of ["desktop", "mobile"])
    for (const ext of ["webp", "jpg"]) assets[`frames/${set}/${f.replace(".webp", "." + ext)}`] = data;
}
for (const f of readdirSync("public/stills")) {
  if (!f.endsWith(".webp")) continue;
  const data = uri(readFileSync(join("public/stills", f)), "image/webp");
  assets[`stills/${f}`] = data;
  assets[`stills/${f.replace(".webp", ".jpg")}`] = data;
}

// dedupe: store each data URI once, map keys to an index
const uniq = [...new Set(Object.values(assets))];
const idx = Object.fromEntries(Object.entries(assets).map(([k, v]) => [k, uniq.indexOf(v)]));
const boot = `<script>(function(){var d=${JSON.stringify(uniq)};var m=${JSON.stringify(idx)};var a={};for(var k in m)a[k]=d[m[k]];window.__ASSETS__=a;})();</script>`;

const htmlPath = join(OUT, "index.html");
if (!existsSync(htmlPath)) throw new Error("Run `vite build --mode single` first");
let html = readFileSync(htmlPath, "utf8");
html = html.replace("<head>", `<head>${boot}`);
writeFileSync(join(OUT, "lockstep.html"), html);
rmSync(TMP, { recursive: true, force: true });
console.log(`✓ ${OUT}/lockstep.html  ${(Buffer.byteLength(html) / 1e6).toFixed(1)} MB`);
