import gsap from "gsap";
import { BRAND } from "../config";
import { qs } from "../lib/env";

export function Loader() {
  return `
<div class="loader" role="status" aria-live="polite" aria-label="Loading ${BRAND}">
  <div class="loader__board">
    <div class="loader__row">
      <span class="mono">${BRAND} · Syncing vault</span>
      <span class="mono loader__live"><i></i>Live</span>
    </div>
    <div class="loader__digits"><span class="loader__num">000</span><span class="loader__pct">%</span></div>
    <div class="loader__bar"><i></i></div>
    <div class="loader__row"><span class="mono">Frames</span><span class="mono loader__count">0</span></div>
  </div>
</div>`;
}

export function initLoader() {
  const root = qs(".loader");
  const num = qs(".loader__num", root);
  const bar = qs(".loader__bar i", root);
  const count = qs(".loader__count", root);
  let shown = 0;
  return {
    set(p: number, loaded: number) {
      const v = Math.round(p * 100);
      if (v === shown) return;
      shown = v;
      num.textContent = String(v).padStart(3, "0");
      bar.style.transform = `scaleX(${p})`;
      count.textContent = String(loaded);
    },
    hide(): Promise<void> {
      return new Promise((res) => {
        gsap.to(root, {
          yPercent: -100,
          duration: 0.9,
          ease: "expo.inOut",
          delay: 0.15,
          onComplete: () => {
            root.remove();
            res();
          },
        });
      });
    },
  };
}
