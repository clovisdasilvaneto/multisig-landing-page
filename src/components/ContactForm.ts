import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BRAND } from "../config";
import { asset, env, img, qs } from "../lib/env";

/** Set to a real endpoint (Formspree, your API, …) to receive requests. */
const ENDPOINT = "";

const MASCOT_ALT = `The ${BRAND} mascot standing in a glowing multi-sig network`;

/** Scroll-scrubbed 1 s clip of the finale; the still alone under reduced motion. */
function mascot() {
  if (env.reducedMotion) return `<img class="contact__mascot" src="${img("stills/finale")}" alt="${MASCOT_ALT}" loading="lazy" decoding="async" width="660" height="880">`;
  return `<video class="contact__mascot" poster="${img("stills/finale")}" aria-label="${MASCOT_ALT}" muted playsinline disablepictureinpicture preload="none" width="660" height="880"></video>`;
}

/** Scrubs the clip by scroll, then fades it out. */
function initMascot() {
  const video = document.querySelector<HTMLVideoElement>("video.contact__mascot");
  if (!video) return;
  // load as a blob so every seek is local (no range requests mid-scrub)
  fetch(asset("stills/finale_clip.mp4"))
    .then((r) => r.blob())
    .then((b) => { video.src = URL.createObjectURL(b); })
    .catch(() => undefined);

  // plays while the section scrolls in, ending as the form lands; fades on the way to the footer
  ScrollTrigger.create({
    trigger: "#contact",
    start: "top bottom",
    end: "top top",
    onUpdate: ({ progress }) => {
      if (video.readyState >= 1 && video.duration) video.currentTime = progress * (video.duration - 0.001);
    },
  });
  gsap.to(video, {
    autoAlpha: 0,
    ease: "none",
    scrollTrigger: { trigger: "#contact", start: "top top", end: "max", scrub: true },
  });
}

export function ContactForm() {
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  return `
<section class="section contact" id="contact" aria-labelledby="contact-title">
  <div class="wipe" aria-hidden="true"></div>
  ${mascot()}
  <div class="contact__col">
    <p class="eyebrow mono"><span class="mono-n">04</span> / Contact</p>
    <h2 class="display display--lg reveal" id="contact-title">Your keys. Your call.</h2>
    <p class="contact__lede">Tell us what you're protecting. A security engineer reads every request and replies within one business day.</p>

    <form class="receipt" novalidate>
      <div class="receipt__head">
        <span class="mono">${BRAND} · Deployment request</span>
        <span class="chip mono">${date}</span>
      </div>
      <div class="receipt__grid">
        <label class="field"><span class="mono">Name / Org</span><input name="name" autocomplete="organization" required placeholder="Ada, Lovelace Labs"></label>
        <label class="field"><span class="mono">Email</span><input name="email" type="email" autocomplete="email" required placeholder="ada@lovelace.xyz"></label>
        <label class="field field--wide"><span class="mono">What are you protecting?</span><textarea name="what" rows="3" required placeholder="A DAO treasury, a fund, payroll, my cold storage…"></textarea></label>
      </div>
      <div class="sig">
        <div class="sig__top"><span class="mono">Signature</span><button type="button" class="sig__clear mono">Clear</button></div>
        <canvas class="sig__pad" aria-label="Signature pad. Optional: if left empty, your typed name is used as the signature."></canvas>
        <span class="sig__x" aria-hidden="true">×</span>
      </div>
      <p class="receipt__error mono" role="alert"></p>
      <div class="receipt__foot">
        <span class="mono receipt__hash">Tx · unsigned</span>
        <button class="btn btn--solid" type="submit" data-magnetic data-cursor>Sign &amp; send →</button>
      </div>
    </form>
  </div>
</section>`;
}

function initSignature(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  let drawing = false;
  let has = false;
  const size = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#0A120E";
    has = false;
  };
  size();
  new ResizeObserver(size).observe(canvas);
  const pos = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  canvas.addEventListener("pointerdown", (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(...pos(e));
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    ctx.lineTo(...pos(e));
    ctx.stroke();
    has = true;
  });
  const end = () => (drawing = false);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  return {
    get has() {
      return has;
    },
    clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      has = false;
    },
    typeName(name: string) {
      const r = canvas.getBoundingClientRect();
      ctx.font = `italic 700 ${Math.min(34, r.height * 0.55)}px "Big Shoulders Display", sans-serif`;
      ctx.fillStyle = "#0A120E";
      ctx.fillText(name, 12, r.height * 0.7);
      has = true;
    },
  };
}

async function hash(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return "0x" + Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function initContact() {
  if (!env.reducedMotion) initMascot();
  const form = qs<HTMLFormElement>(".receipt");
  const sig = initSignature(qs<HTMLCanvasElement>(".sig__pad", form));
  const err = qs(".receipt__error", form);
  const out = qs(".receipt__hash", form);
  const btn = qs<HTMLButtonElement>("button[type=submit]", form);
  qs(".sig__clear", form).addEventListener("click", () => sig.clear());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const missing = [...form.querySelectorAll<HTMLInputElement>("[required]")].find((f) => !f.value.trim() || !f.checkValidity());
    if (missing) {
      err.textContent = missing.type === "email" && missing.value ? "Enter a valid email address." : "Fill in every field before signing.";
      missing.focus();
      return;
    }
    err.textContent = "";
    if (!sig.has) sig.typeName(data.name);
    btn.disabled = true;
    btn.textContent = "Signing…";
    try {
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(String(res.status));
      }
      const h = await hash(JSON.stringify(data) + Date.now());
      out.textContent = `Tx · ${h.slice(0, 10)}…${h.slice(-6)}`;
      form.classList.add("is-sent");
      btn.textContent = "Signed & sent ✓";
    } catch {
      err.textContent = "Couldn't send the request. Check your connection and sign again.";
      btn.disabled = false;
      btn.textContent = "Sign & send →";
    }
  });
}
