import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { env } from "./env";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
/** Anchors whose scroll position is computed (e.g. a point inside a pin). */
const virtualAnchors = new Map<string, () => number>();

export function initSmoothScroll() {
  if (env.reducedMotion) return null;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.2 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;
export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();

export function registerAnchor(hash: string, fn: () => number) {
  virtualAnchors.set(hash, fn);
}

export function scrollToTarget(target: string | number) {
  let y: number | null = null;
  if (typeof target === "number") y = target;
  else if (virtualAnchors.has(target)) y = virtualAnchors.get(target)!();
  else {
    const el = document.querySelector(target);
    if (el) y = el.getBoundingClientRect().top + window.scrollY;
  }
  if (y === null) return;
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: env.reducedMotion ? "auto" : "smooth" });
}

/** Delegate all in-page anchor clicks to the scroller. */
export function bindAnchors() {
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute("href")!;
    if (hash === "#") return;
    e.preventDefault();
    scrollToTarget(hash === "#top" ? 0 : hash);
    history.replaceState(null, "", hash === "#top" ? location.pathname : hash);
  });
}
