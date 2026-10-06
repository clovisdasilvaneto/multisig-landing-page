import { COLORS } from "../config";

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const G = hex(COLORS.green);
const F = hex(COLORS.fire);
let last = -1;

/** 0 = neon green, 1 = fire orange. Writes CSS vars on :root. */
export function setAccentMix(t: number) {
  t = Math.round(Math.min(1, Math.max(0, t)) * 200) / 200;
  if (t === last) return;
  last = t;
  const rgb = G.map((g, i) => Math.round(g + (F[i] - g) * t));
  const s = document.documentElement.style;
  s.setProperty("--accent", `rgb(${rgb.join(" ")})`);
  s.setProperty("--accent-rgb", rgb.join(" "));
  s.setProperty("--threat", String(t));
}
