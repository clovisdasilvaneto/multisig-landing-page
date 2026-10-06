const mq = (q: string) => typeof matchMedia !== "undefined" && matchMedia(q).matches;

export const env = {
  reducedMotion: mq("(prefers-reduced-motion: reduce)"),
  finePointer: mq("(hover: hover) and (pointer: fine)"),
  /** Decided once at boot: frame set + pin lengths don't swap mid-session. */
  mobile: mq("(max-width: 767px)") || (mq("(pointer: coarse)") && mq("(max-width: 1023px)")),
};

declare global {
  interface Window {
    /** Injected by the single-file build: path -> data URI. */
    __ASSETS__?: Record<string, string>;
  }
}

/** Resolve a public asset path (data URI in the single-file build). */
export function asset(path: string): string {
  const key = path.replace(/^\//, "");
  return window.__ASSETS__?.[key] ?? `${import.meta.env.BASE_URL}${key}`;
}

/** <picture>-free helper: prefer webp, fall back to jpg. */
let webpOk: boolean | null = null;
export function supportsWebp(): boolean {
  if (webpOk !== null) return webpOk;
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    webpOk = c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    webpOk = false;
  }
  return webpOk;
}

export function img(pathNoExt: string): string {
  return asset(`${pathNoExt}.${supportsWebp() ? "webp" : "jpg"}`);
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const qs = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector(sel) as T;
export const qsa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll(sel)) as T[];
