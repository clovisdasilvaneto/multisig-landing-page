import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BRAND, NAV } from "../config";
import { env, qs } from "../lib/env";

export function ScoreboardFooter() {
  return `
<footer class="footer" role="contentinfo">
  <div class="wipe" aria-hidden="true"></div>
  <div class="board-score glass">
    <span class="score__team">${BRAND}</span>
    <div class="score__digits" aria-label="Infinity to zero">
      <span class="score__l">∞</span><span class="score__sep">:</span><span class="score__r">00</span>
    </div>
    <span class="score__label mono">Single points<br>of failure</span>
  </div>
  <div class="footer__bar">
    <span class="mono">© ${new Date().getFullYear()} ${BRAND}. Your keys stay yours.</span>
    <nav class="footer__nav" aria-label="Footer">${NAV.map((l) => `<a class="mono" href="${l.href}">${l.label}</a>`).join("")}</nav>
    <a class="btn btn--pill mono" href="#top" data-magnetic data-cursor>Back to top ↑</a>
  </div>
</footer>`;
}

export function initFooter() {
  if (env.reducedMotion) return;
  const l = qs(".score__l");
  const r = qs(".score__r");
  const o = { v: 0 };
  ScrollTrigger.create({
    trigger: ".board-score",
    start: "top 85%",
    once: true,
    onEnter: () => {
      l.textContent = "00";
      gsap.timeline()
        .to(o, {
          v: 99,
          duration: 1.4,
          ease: "power2.in",
          onUpdate: () => (l.textContent = String(Math.round(o.v)).padStart(2, "0")),
        })
        .call(() => {
          l.textContent = "∞";
          l.classList.add("is-inf");
        })
        .fromTo(r, { opacity: 0.2 }, { opacity: 1, duration: 0.12, repeat: 3, yoyo: true }, 0.2);
    },
  });
}
