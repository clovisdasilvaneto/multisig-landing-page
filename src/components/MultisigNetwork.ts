import gsap from "gsap";
import { SIGNER_FRAMES } from "../config";
import { qs, qsa } from "../lib/env";
import { padlock } from "../lib/icons";
import { splitChars } from "../lib/split";
import { store } from "../lib/state";

const CHIP_Y = [26, 100, 174];

export function MultisigNetwork() {
  return `
<div class="chapter multisig" data-chapter="multisig">
  <p class="eyebrow mono"><span class="mono-n">01</span> / Multi-sig</p>
  <h2 class="display ms__title">It takes more than one key.</h2>
  <div class="ms__panel glass">
    <svg class="ms__svg" viewBox="0 0 440 240" role="img" aria-label="Three signers connect to unlock the vault">
      ${CHIP_Y.map(
        (y, i) => `
        <path class="ms__line ms__line--base" d="M150 ${y + 20} C 250 ${y + 20}, 260 120, 336 120"/>
        <path class="ms__line ms__line--live" pathLength="1" d="M150 ${y + 20} C 250 ${y + 20}, 260 120, 336 120"/>
        <g class="ms__chip" data-i="${i}">
          <rect x="6" y="${y}" width="144" height="40" rx="20"/>
          <circle cx="28" cy="${y + 20}" r="6"/>
          <text x="44" y="${y + 25}">SIGNER 0${i + 1}</text>
        </g>`
      ).join("")}
      <g class="ms__lock">
        <circle class="ms__ring" cx="380" cy="120" r="44"/>
        <circle class="ms__ring-live" cx="380" cy="120" r="44" pathLength="1"/>
        <g class="ms__icon">${[false, true].map((o) => padlock(o, o ? "ms__open" : "ms__closed").replace("<svg ", '<svg x="358" y="98" width="44" height="44" ')).join("")}</g>
      </g>
    </svg>
    <p class="ms__status mono"><span>Threshold</span> <b class="ms__count">0/3</b> <span class="ms__state">Awaiting signatures</span></p>
  </div>
</div>`;
}

export function multisigTimeline(tl: gsap.core.Timeline) {
  const root = qs(".multisig");
  const chars = splitChars(qs(".ms__title", root));
  const chips = qsa(".ms__chip", root);
  const lines = qsa(".ms__line--live", root);

  gsap.set(root, { autoAlpha: 0 });
  gsap.set(chars, { yPercent: 110 });
  gsap.set(lines, { strokeDashoffset: 1 });
  gsap.set(".ms__ring-live", { strokeDashoffset: 1 });
  gsap.set(chips, { "--on": 0 });
  gsap.set(".ms__lock", { "--open": 0 });

  tl.set(root, { autoAlpha: 1 }, 96)
    .from(".multisig .eyebrow", { opacity: 0, x: -20, duration: 4 }, 96)
    .to(chars, { yPercent: 0, ease: "power3.out", duration: 4, stagger: 0.35 }, 97)
    .from(".ms__panel", { opacity: 0, y: 30, duration: 5 }, 101);

  SIGNER_FRAMES.forEach((f, i) => {
    tl.to(chips[i], { "--on": 1, duration: 3 }, f - 3)
      .to(lines[i], { strokeDashoffset: 0, ease: "power1.inOut", duration: 8 }, f);
  });
  const last = SIGNER_FRAMES[SIGNER_FRAMES.length - 1];
  tl.to(".ms__ring-live", { strokeDashoffset: 0, duration: 6 }, last + 2)
    .to(".ms__lock", { "--open": 1, duration: 3 }, last + 7);

  const count = qs(".ms__count", root);
  const state = qs(".ms__state", root);
  const panel = qs(".ms__panel", root);
  store.sub(({ frame }) => {
    const n = SIGNER_FRAMES.filter((sf) => frame >= sf).length;
    count.textContent = `${n}/3`;
    const met = frame >= last + 7;
    state.textContent = met ? "Unlocked" : n ? "Collecting signatures" : "Awaiting signatures";
    panel.classList.toggle("is-met", met);
  });
}
