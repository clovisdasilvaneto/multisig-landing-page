import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FIRE, SIGNER_FRAMES } from "../config";
import { clamp, qs, qsa } from "../lib/env";
import { store } from "../lib/state";

const GENESIS = 21_408_000;

export function Hud() {
  return `
<aside class="hud glass" aria-label="Vault status">
  <div class="hud__row">
    <span class="mono hud__label">Block #</span>
    <span class="hud__block" aria-live="off">${GENESIS.toLocaleString("en-US")}</span>
  </div>
  <div class="hud__row hud__row--threat">
    <span class="mono hud__label">Threat level</span>
    <span class="mono hud__threat-val">00</span>
  </div>
  <div class="hud__meter" role="meter" aria-label="Threat level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>
  <div class="hud__row">
    <span class="mono hud__label">Signers</span>
    <span class="hud__signers"><i></i><i></i><i></i><b class="mono">0/3</b></span>
  </div>
</aside>`;
}

/** 0..1 threat curve that follows the fire beat. */
function threat(f: number) {
  if (f < FIRE.in[0]) return 0.04;
  if (f < FIRE.in[1]) return clamp((f - FIRE.in[0]) / (FIRE.in[1] - FIRE.in[0]), 0.04, 1);
  if (f < FIRE.out[0]) return 0.92 + Math.sin(f * 0.9) * 0.08; // flicker at the peak
  if (f < FIRE.out[1]) return 1 - (f - FIRE.out[0]) / (FIRE.out[1] - FIRE.out[0]);
  return 0.02;
}

export function initHud() {
  const root = qs(".hud");
  const block = qs(".hud__block", root);
  const meter = qs(".hud__meter", root);
  const bar = qs(".hud__meter i", root);
  const tval = qs(".hud__threat-val", root);
  const pips = qsa(".hud__signers i", root);
  const count = qs(".hud__signers b", root);

  let lastBlock = -1;
  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const n = GENESIS + Math.floor(window.scrollY / 24);
      if (n !== lastBlock) {
        lastBlock = n;
        block.textContent = n.toLocaleString("en-US");
      }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // The HUD belongs to the video story; it steps aside for the sections below.
  ScrollTrigger.create({
    trigger: ".ticker",
    start: "top 30%",
    onToggle: (self) => root.classList.toggle("is-away", self.isActive),
    end: () => document.documentElement.scrollHeight,
  });

  store.sub(({ frame }) => {
    const t = threat(frame);
    bar.style.transform = `scaleX(${t})`;
    const v = Math.round(t * 100);
    tval.textContent = String(Math.min(99, v)).padStart(2, "0");
    meter.setAttribute("aria-valuenow", String(v));
    root.classList.toggle("is-hot", t > 0.5);
    const n = SIGNER_FRAMES.filter((sf) => frame >= sf).length;
    pips.forEach((p, i) => p.classList.toggle("on", i < n));
    count.textContent = `${n}/3`;
    root.classList.toggle("is-secured", n === 3);
  });
}
