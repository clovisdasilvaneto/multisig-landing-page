import gsap from "gsap";
import { BRAND } from "../config";
import { qs } from "../lib/env";
import { splitChars, splitWords } from "../lib/split";

export function Manifesto() {
  return `
<div class="chapter attack" data-chapter="attack">
  <p class="eyebrow mono"><span class="mono-n">01</span> / Manifesto</p>
  <h2 class="display attack__title">No single point of failure.</h2>
  <p class="attack__copy">
    <mark>Hacks happen.</mark> <mark>Keys leak.</mark> <mark>Exchanges burn.</mark>
    ${BRAND} is built for the moment everything catches fire, and <mark>the vault keeps walking.</mark>
  </p>
</div>`;
}

export function manifestoTimeline(tl: gsap.core.Timeline) {
  const root = qs(".attack");
  const chars = splitChars(qs(".attack__title", root));
  const words = splitWords(qs(".attack__copy", root));
  const plain = words.filter((w) => !w.classList.contains("word--hl"));

  gsap.set(root, { autoAlpha: 0 });
  gsap.set(chars, { yPercent: -120, scaleY: 1.8, transformOrigin: "50% 0%" });
  gsap.set(words, { opacity: 0.08 });

  tl.set(root, { autoAlpha: 1 }, 36)
    .from(".attack .eyebrow", { opacity: 0, x: -20, duration: 4 }, 36)
    // letters slam down
    .to(chars, { yPercent: 0, scaleY: 1, ease: "power4.in", duration: 3, stagger: 0.4 }, 37)
    // word-by-word reveal through the fire peak
    .to(words, { opacity: 1, ease: "none", duration: 1.2, stagger: 26 / words.length }, 52)
    // the rest dims so the highlighted phrases carry the read
    .to(plain, { opacity: 0.38, ease: "none", duration: 4 }, 81)
    // exit
    .to(root, { yPercent: -18, autoAlpha: 0, ease: "power1.in", duration: 7 }, 88);
}
