import gsap from "gsap";
import { BRAND, TAGLINE } from "../config";
import { qs } from "../lib/env";
import { splitChars } from "../lib/split";

export function Hero() {
  return `
<div class="chapter hero" data-chapter="hero">
  <div class="hero__meta">
    <span class="mono">Est. 2026 · ${TAGLINE}</span>
    <span class="mono hero__hint">Scroll to deploy <span class="hero__arrow">↓</span></span>
  </div>
  <h1 class="hero__word">${BRAND}</h1>
</div>`;
}

let chars: HTMLElement[] = [];

/** Fit the wordmark to the full viewport width. */
function fit() {
  const h = qs<HTMLElement>(".hero__word");
  h.style.fontSize = "100px";
  const w = h.getBoundingClientRect().width;
  const cs = getComputedStyle(h.parentElement!);
  const target = h.parentElement!.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  h.style.fontSize = `${(100 * target) / w}px`;
}

export function initHero() {
  const h = qs<HTMLElement>(".hero__word");
  chars = splitChars(h);
  fit();
  document.fonts?.ready.then(fit);
  window.addEventListener("resize", fit);
  gsap.set(chars, { yPercent: 105 });
}

/** The one orchestrated page-load moment, played when the loader lifts. */
export function playHeroIntro(reduced: boolean) {
  if (reduced) {
    gsap.set(chars, { yPercent: 0 });
    return;
  }
  const tl = gsap.timeline();
  tl.to(chars, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.05 }, 0.1)
    .from(".hero__meta > *", { opacity: 0, y: 10, duration: 0.6, stagger: 0.1 }, 0.6)
    .from(".nav", { opacity: 0, y: -12, duration: 0.7 }, 0.5)
    // HUD opacity is owned by CSS (it hides below the story), so only slide it
    .from(".hud", { y: -16, scale: 0.96, duration: 0.7, ease: "back.out(2)" }, 0.62);
}

/** Scroll-driven exit (positions are frame units on the stage timeline). */
export function heroTimeline(tl: gsap.core.Timeline) {
  tl.to(".hero__word", { yPercent: 55, opacity: 0, ease: "power2.in", duration: 26 }, 3)
    .to(".hero__meta", { opacity: 0, y: 20, ease: "none", duration: 10 }, 2);
}
