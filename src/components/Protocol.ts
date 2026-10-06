import { ScrollTrigger } from "gsap/ScrollTrigger";
import { env, img, qs, qsa } from "../lib/env";
import { registerAnchor, scrollToTarget } from "../lib/smooth";

const STEPS = [
  { title: "Create safe", still: "stills/step1", desc: "Deploy a smart account that holds your assets instead of one private key." },
  { title: "Add signers", still: "stills/step2", desc: "Invite the people and devices that can approve: a laptop, a phone, a cofounder." },
  { title: "Set threshold", still: "stills/step3", desc: "Choose how many must agree. With 2-of-3, one lost key changes nothing." },
  { title: "Execute", still: "stills/step4", desc: "Two signatures land and the transaction runs. Nothing in between can fail alone." },
];

/** Signer → vault arrow paths (S1, S2, S3). */
const ARROWS = ["M132 92 C 190 120, 220 150, 248 180", "M132 308 C 190 280, 220 250, 248 220", "M468 92 C 410 120, 380 150, 352 180"];

/** Whiteboard play diagram. Elements carry .from-N and draw in at step >= N. */
const diagram = `
<svg class="board__svg" viewBox="0 0 600 400" role="img" aria-label="Protocol diagram">
  <defs>
    <marker id="arw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10z" fill="currentColor"/>
    </marker>
    ${[0, 1, 2].map((i) => `<mask id="m${i}" maskUnits="userSpaceOnUse"><path class="draw mask-2" pathLength="1" stroke="#fff" stroke-width="8" fill="none" d="${ARROWS[i]}"/></mask>`).join("")}
    <mask id="mx" maskUnits="userSpaceOnUse"><path class="draw mask-4" pathLength="1" stroke="#fff" stroke-width="8" fill="none" d="M352 214 C 420 222, 462 268, 514 298"/></mask>
  </defs>
  <!-- court-style guide lines -->
  <g class="board__guides">
    <circle cx="300" cy="200" r="120"/><line x1="0" y1="200" x2="600" y2="200"/>
    <path d="M40 0 V 400 M560 0 V 400"/>
  </g>

  <!-- 01 vault -->
  <g class="from-1">
    <rect class="draw" pathLength="1" x="250" y="160" width="100" height="80" rx="14"/>
    <path class="draw" pathLength="1" d="M282 172 V 160 a18 18 0 0 1 36 0 V172" transform="translate(0 -14)"/>
    <text class="board__lbl fade" x="300" y="208" text-anchor="middle">SAFE</text>
  </g>

  <!-- 02 signers + dashed arrows -->
  ${[[110, 80], [110, 320], [490, 80]]
    .map(
      ([x, y], i) => `
  <g class="from-2 sig-${i}">
    <circle class="draw node" pathLength="1" cx="${x}" cy="${y}" r="22"/>
    <text class="board__lbl fade" x="${x}" y="${y + 5}" text-anchor="middle">S${i + 1}</text>
    <path class="arrow dashed" mask="url(#m${i})" marker-end="url(#arw)" d="${ARROWS[i]}"/>
  </g>`
    )
    .join("")}

  <!-- 03 threshold: two arrows go solid, S3 is crossed out -->
  <g class="from-3">
    <path class="arrow solid draw" pathLength="1" d="${ARROWS[0]}"/>
    <path class="arrow solid draw" pathLength="1" d="${ARROWS[1]}"/>
    <path class="draw x" pathLength="1" d="M402 120 l20 20"/><path class="draw x" pathLength="1" d="M422 120 l-20 20"/>
    <g class="fade"><rect class="badge" x="318" y="236" width="64" height="30" rx="15"/><text class="board__badge" x="350" y="256" text-anchor="middle">2 / 3</text></g>
  </g>

  <!-- 04 execute -->
  <g class="from-4">
    <path class="arrow exec" mask="url(#mx)" marker-end="url(#arw)" d="M352 214 C 420 222, 462 268, 514 298"/>
    <circle class="draw node node--tx" pathLength="1" cx="540" cy="312" r="22"/>
    <path class="draw check" pathLength="1" d="M530 312 l7 7 l13 -14"/>
  </g>
</svg>`;


export function Protocol() {
  return `
<section class="section protocol" id="protocol" aria-labelledby="protocol-title">
  <div class="wipe" aria-hidden="true"></div>
  <div class="protocol__pin">
    <div class="protocol__head">
      <div>
        <p class="eyebrow mono"><span class="mono-n">03</span> / Protocol</p>
        <h2 class="display display--lg reveal" id="protocol-title">The Protocol</h2>
      </div>
      <div class="protocol__hud glass">
        <div class="protocol__tabs" role="tablist" aria-label="Protocol steps">
          ${STEPS.map((s, i) => `<button role="tab" class="tab" id="tab-${i}" aria-controls="step-panel" aria-selected="${i === 0}" data-step="${i}" data-cursor>0${i + 1}<span class="sr-only"> ${s.title}</span></button>`).join("")}
        </div>
        <div class="protocol__count mono"><span>Step</span><b class="protocol__n">1</b><span>of 4</span></div>
      </div>
    </div>
    <div class="protocol__body" id="step-panel" role="tabpanel" aria-live="polite">
      <div class="board">${diagram}
        <div class="board__legend mono"><span><i class="lg lg--dash"></i>Pending</span><span><i class="lg lg--solid"></i>Signed</span><span><i class="lg lg--x">×</i>Not needed</span></div>
      </div>
      <div class="protocol__side">
        <figure class="still glass">
          ${STEPS.map((s, i) => `<img class="still__img${i === 0 ? " is-on" : ""}" src="${img(s.still)}" alt="" loading="lazy" decoding="async" width="660" height="880">`).join("")}
          <figcaption class="mono">Field cam · ${STEPS.length} steps</figcaption>
        </figure>
        <p class="mono protocol__kicker">Step <span class="protocol__n">1</span> of 4</p>
        <h3 class="protocol__title">${STEPS[0].title}</h3>
        <p class="protocol__desc">${STEPS[0].desc}</p>
      </div>
    </div>
  </div>
</section>`;
}

export function initProtocol() {
  const root = qs(".protocol");
  const svg = qs<SVGSVGElement>(".board__svg", root);
  const tabs = qsa<HTMLButtonElement>(".tab", root);
  const title = qs(".protocol__title", root);
  const desc = qs(".protocol__desc", root);
  const ns = qsa(".protocol__n", root);
  const stills = qsa(".still__img", root);
  let current = -1;

  const setStep = (i: number) => {
    if (i === current) return;
    current = i;
    for (let k = 1; k <= 4; k++) svg.classList.toggle(`s${k}`, i + 1 >= k);
    tabs.forEach((t, k) => {
      t.setAttribute("aria-selected", String(k === i));
      t.classList.toggle("is-done", k < i);
    });
    ns.forEach((n) => (n.textContent = String(i + 1)));
    stills.forEach((s, k) => s.classList.toggle("is-on", k === i));
    title.textContent = STEPS[i].title;
    desc.textContent = STEPS[i].desc;
    root.dataset.step = String(i + 1);
    title.classList.remove("swap");
    void title.offsetWidth;
    title.classList.add("swap");
  };
  setStep(0);

  if (env.reducedMotion) {
    tabs.forEach((t, i) => t.addEventListener("click", () => setStep(i)));
    return;
  }

  const st = ScrollTrigger.create({
    trigger: root,
    pin: qs(".protocol__pin", root),
    start: "top top",
    end: env.mobile ? "+=200%" : "+=300%",
    onUpdate: (self) => setStep(Math.min(3, Math.floor(self.progress * 4))),
  });
  const stepY = (i: number) => st.start + (st.end - st.start) * ((i + 0.5) / 4);
  tabs.forEach((t, i) => t.addEventListener("click", () => scrollToTarget(stepY(i))));
  registerAnchor("#protocol", () => st.start);
}
