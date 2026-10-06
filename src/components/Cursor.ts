import gsap from "gsap";
import { env } from "../lib/env";
import { padlock } from "../lib/icons";

const INTERACTIVE = "a, button, [data-cursor], .card, label, input, textarea, canvas.sig__pad";

/** Padlock-dot cursor + magnetic buttons. Fine pointers only. */
export function initCursor() {
  if (!env.finePointer || env.reducedMotion) return;
  const el = document.createElement("div");
  el.className = "cursor";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<span class="cursor__dot"></span><span class="cursor__lock">${padlock()}</span>`;
  document.body.append(el);
  document.documentElement.classList.add("has-cursor");

  const x = gsap.quickTo(el, "x", { duration: 0.18, ease: "power3" });
  const y = gsap.quickTo(el, "y", { duration: 0.18, ease: "power3" });
  window.addEventListener("pointermove", (e) => {
    x(e.clientX);
    y(e.clientY);
    const t = (e.target as Element).closest?.(INTERACTIVE);
    el.classList.toggle("is-hover", !!t);
    el.classList.toggle("is-text", !!(e.target as Element).closest?.("input, textarea"));
  });
  document.addEventListener("pointerleave", () => el.classList.add("is-out"));
  document.addEventListener("pointerenter", () => el.classList.remove("is-out"));

  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((btn) => {
    const mx = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
    const my = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * 0.3);
      my((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    btn.addEventListener("pointerleave", () => {
      mx(0);
      my(0);
    });
  });
}
