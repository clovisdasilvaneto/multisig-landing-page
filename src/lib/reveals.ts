import gsap from "gsap";
import { env, qsa } from "./env";
import { splitChars } from "./split";

/** Char-split headline reveals + accent wipes at section boundaries. */
export function initReveals() {
  if (env.reducedMotion) return;
  qsa(".reveal").forEach((el) => {
    const chars = splitChars(el);
    gsap.set(chars, { yPercent: 110 });
    gsap.to(chars, {
      yPercent: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.025,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });
  qsa(".wipe").forEach((w) => {
    gsap.timeline({ scrollTrigger: { trigger: w, start: "top 92%", once: true } })
      .fromTo(w, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.45, ease: "power3.in" })
      .set(w, { transformOrigin: "100% 50%" })
      .to(w, { scaleX: 0, duration: 0.5, ease: "power3.out" });
  });
}
