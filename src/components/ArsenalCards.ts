import gsap from "gsap";
import { env, img, qsa } from "../lib/env";
import { padlock } from "../lib/icons";

const CARDS = [
  {
    n: "01", cat: "Storage", title: "The Vault", art: "stills/vault",
    bullets: [
      "Assets sit in a smart account, not behind one private key",
      "Spending limits per asset, per day, per signer",
      "Every movement recorded onchain for audit",
    ],
  },
  {
    n: "02", cat: "Approvals", title: "The Co-Signer", art: "stills/cosigner",
    bullets: [
      "Approve from a phone, a laptop or a hardware wallet",
      "Transactions wait in a queue until enough keys agree",
      "Thresholds you choose: 2-of-3, 3-of-5, your rules",
    ],
  },
  {
    n: "03", cat: "Monitoring", title: "The Guardian", art: "stills/guardian",
    bullets: [
      "Simulates each transaction before anyone signs",
      "Flags unknown contracts and unlimited approvals",
      "Alerts every signer when something looks off",
    ],
  },
  {
    n: "04", cat: "Continuity", title: "The Recovery", art: "stills/recovery",
    bullets: [
      "Lose a key, replace the signer. The vault stays put",
      "Optional time-delayed recovery by people you trust",
      "No single seed phrase holding the treasury hostage",
    ],
  },
];

export function ArsenalCards() {
  return `
<section class="section arsenal" id="arsenal" aria-labelledby="arsenal-title">
  <div class="wipe" aria-hidden="true"></div>
  <div class="arsenal__head">
    <div>
      <p class="eyebrow mono"><span class="mono-n">02</span> / Arsenal</p>
      <h2 class="display display--xl reveal" id="arsenal-title">The Arsenal</h2>
    </div>
    <div class="arsenal__intro">
      <p>Four pieces of protection, one vault. Run them all together or pick the ones your treasury needs.</p>
      <p class="mono arsenal__hint"><span class="pulse"></span>${env.finePointer ? "Hover or tap a card to flip it" : "Tap a card to flip it"}</p>
    </div>
  </div>
  <ul class="cards" role="list">
    ${CARDS.map(
      (c) => `
    <li class="card" tabindex="0" role="button" aria-pressed="false" aria-label="${c.title}: show features">
      <div class="card__tilt">
        <div class="card__flip">
          <div class="card__face card__front">
            <img class="card__art" src="${img(c.art)}" alt="" loading="lazy" decoding="async" width="660" height="880">
            <span class="card__num" aria-hidden="true">${c.n}</span>
            <span class="card__cat mono">${c.cat}</span>
            <div class="card__foot">
              <span class="mono card__label">${c.cat}</span>
              <h3 class="card__title">${c.title}</h3>
            </div>
            <span class="card__glare" aria-hidden="true"></span>
          </div>
          <div class="card__face card__back">
            <div class="card__back-top">
              <span class="card__num card__num--sm" aria-hidden="true">${c.n}</span>
              <span class="card__lock">${padlock()}</span>
            </div>
            <h3 class="card__title">${c.title}</h3>
            <ul class="card__list">${c.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
            <span class="mono card__foot-label">${c.cat} · ${c.n}/04</span>
          </div>
        </div>
      </div>
    </li>`
    ).join("")}
  </ul>
</section>`;
}

export function initArsenal() {
  qsa<HTMLElement>(".card").forEach((card) => {
    const tilt = card.querySelector<HTMLElement>(".card__tilt")!;
    const setFlip = (on: boolean) => {
      card.classList.toggle("is-flipped", on);
      card.setAttribute("aria-pressed", String(on));
    };

    if (env.finePointer) {
      card.addEventListener("pointerenter", () => setFlip(true));
      card.addEventListener("pointerleave", () => {
        setFlip(false);
        if (!env.reducedMotion) gsap.to(tilt, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3" });
      });
      if (!env.reducedMotion) {
        const rx = gsap.quickTo(tilt, "rotateX", { duration: 0.4, ease: "power3" });
        const ry = gsap.quickTo(tilt, "rotateY", { duration: 0.4, ease: "power3" });
        card.addEventListener("pointermove", (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          ry((px - 0.5) * 16);
          rx((0.5 - py) * 12);
          card.style.setProperty("--gx", `${px * 100}%`);
          card.style.setProperty("--gy", `${py * 100}%`);
        });
      }
    } else {
      card.addEventListener("click", () => setFlip(!card.classList.contains("is-flipped")));
    }
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setFlip(!card.classList.contains("is-flipped"));
      }
    });
  });
}
