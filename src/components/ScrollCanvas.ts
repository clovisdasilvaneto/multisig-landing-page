import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS, FIRE, FRAME_COUNT, MASCOT_TRACK, STAGE_VH } from "../config";
import { setAccentMix } from "../lib/accent";
import { clamp, env, img, lerp, qs, qsa } from "../lib/env";
import { FrameStore } from "../lib/frames";
import { registerAnchor } from "../lib/smooth";
import { store } from "../lib/state";
import { Hero, heroTimeline } from "./Hero";
import { Manifesto, manifestoTimeline } from "./Manifesto";
import { MultisigNetwork, multisigTimeline } from "./MultisigNetwork";

const LAST = FRAME_COUNT - 1;

export function ScrollCanvas() {
  return `
<section class="stage" id="stage" aria-label="Story: the vault walks through the fire">
  <div class="stage__pin">
    <div class="stage__media">
      <canvas class="stage__canvas" aria-hidden="true"></canvas>
      <div class="fx fx--vignette" aria-hidden="true"></div>
      <div class="fx fx--scan" aria-hidden="true"></div>
      <div class="fx fx--grain" aria-hidden="true"></div>
    </div>
    ${Hero()}
    ${Manifesto()}
    ${MultisigNetwork()}
  </div>
</section>`;
}

/** Interpolate the mascot's x position in the source frame. */
function mascotX(f: number) {
  for (let i = 1; i < MASCOT_TRACK.length; i++) {
    const [f1, x1] = MASCOT_TRACK[i];
    const [f0, x0] = MASCOT_TRACK[i - 1];
    if (f <= f1) return lerp(x0, x1, (f - f0) / (f1 - f0));
  }
  return MASCOT_TRACK[MASCOT_TRACK.length - 1][1];
}

export function initScrollCanvas(frames: FrameStore) {
  const stage = qs("#stage");
  const pin = qs(".stage__pin", stage);
  const canvas = qs<HTMLCanvasElement>(".stage__canvas", stage);
  const ctx = canvas.getContext("2d", { alpha: false })!;

  /** Animated state; the timeline writes it, the ticker draws it. */
  const s = { frame: 0, vx: 0.5, accent: 0 };
  let dirty = true;
  let lastImg: HTMLImageElement | null = null;
  let lastFrame = -1;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    // cap backing store near the source resolution, no point going higher
    const maxW = env.mobile ? 1100 : 1920;
    const dpr = clamp(Math.min(window.devicePixelRatio || 1, maxW / r.width), 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    dirty = true;
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const draw = () => {
    const f = Math.round(s.frame);
    const im = frames.nearest(f);
    if (!im || (!dirty && im === lastImg && f === lastFrame)) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = im.naturalWidth, ih = im.naturalHeight;
    const k = Math.max(cw / iw, ch / ih);
    const dw = iw * k, dh = ih * k;
    // "cover" fit, panned so the mascot sits at vx across the viewport
    const dx = clamp(cw * s.vx - mascotX(f) * dw, cw - dw, 0);
    const dy = (ch - dh) * 0.55;
    ctx.drawImage(im, dx, dy, dw, dh);
    lastImg = im;
    lastFrame = f;
    dirty = false;
  };
  gsap.ticker.add(draw);

  // ---------- reduced motion: three static key frames, no scrub ----------
  if (env.reducedMotion) {
    gsap.ticker.remove(draw);
    const keys = ["stills/key_18", "stills/key_70", "stills/key_132"];
    qsa(".chapter", stage).forEach((c, i) => {
      c.insertAdjacentHTML("afterbegin", `<img class="chapter__bg" src="${img(keys[i])}" alt="" loading="lazy">`);
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          const i = qsa(".chapter", stage).indexOf(e.target as HTMLElement);
          const frame = [CHAPTERS.hero[0], 70, LAST][i];
          store.set({ frame });
          setAccentMix(i === 1 ? 1 : 0);
        }),
      { threshold: 0.45 }
    );
    qsa(".chapter", stage).forEach((c) => io.observe(c));
    qs(".ms__count").textContent = "3/3";
    qs(".ms__state").textContent = "Unlocked";
    qs(".ms__panel").classList.add("is-met");
    return;
  }

  // ---------- master scrubbed timeline (1 unit = 1 frame) ----------
  const vh = env.mobile ? STAGE_VH.mobile : STAGE_VH.desktop;
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    onUpdate: () => {
      store.set({ frame: s.frame });
      setAccentMix(s.accent);
    },
    scrollTrigger: {
      trigger: stage,
      pin,
      start: "top top",
      end: `+=${vh}%`,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
  tl.to(s, { frame: LAST, duration: LAST }, 0);
  if (!env.mobile) tl.to(s, { vx: 0.7, duration: 14, ease: "sine.inOut" }, 28);
  tl.to(s, { accent: 1, duration: FIRE.in[1] - FIRE.in[0], ease: "sine.in" }, FIRE.in[0])
    .to(s, { accent: 0, duration: FIRE.out[1] - FIRE.out[0], ease: "sine.inOut" }, FIRE.out[0]);

  heroTimeline(tl);
  manifestoTimeline(tl);
  multisigTimeline(tl);

  // nav anchors that live inside the pin
  const st = tl.scrollTrigger!;
  const at = (frame: number) => () => st.start + (st.end - st.start) * (frame / LAST);
  registerAnchor("#manifesto", at(60));

  // after the pin releases, the canvas fades away as the stage scrolls off
  gsap.to(".stage__media", {
    opacity: 0,
    scale: 1.04,
    ease: "none",
    scrollTrigger: { trigger: stage, start: () => st.end, end: () => st.end + window.innerHeight * 0.8, scrub: true },
  });

  frames.onProgress(() => (dirty = true));
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
