import { FRAME_COUNT } from "../config";
import { asset, env, supportsWebp } from "./env";

/**
 * Progressive image-sequence loader.
 * Loads a coarse pass first (every 4th frame) so scrubbing works almost
 * immediately, then fills the gaps in the background.
 */
export class FrameStore {
  readonly images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
  private order: number[] = [];
  readonly priorityCount: number;
  private loadedPriority = 0;
  private listeners = new Set<(p: number) => void>();
  private priorityDone!: () => void;
  readonly ready = new Promise<void>((r) => (this.priorityDone = r));

  constructor(private concurrency = 6) {
    const seen = new Set<number>();
    const push = (i: number) => {
      if (i < FRAME_COUNT && !seen.has(i)) {
        seen.add(i);
        this.order.push(i);
      }
    };
    push(0);
    push(FRAME_COUNT - 1);
    for (const stride of [16, 8, 4]) for (let i = 0; i < FRAME_COUNT; i += stride) push(i);
    this.priorityCount = this.order.length;
    for (const stride of [2, 1]) for (let i = 0; i < FRAME_COUNT; i += stride) push(i);
  }

  url(i: number) {
    const set = env.mobile ? "mobile" : "desktop";
    const ext = supportsWebp() ? "webp" : "jpg";
    return asset(`frames/${set}/f_${String(i + 1).padStart(4, "0")}.${ext}`);
  }

  onProgress(fn: (p: number) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  start() {
    let cursor = 0;
    const next = (): Promise<void> | void => {
      if (cursor >= this.order.length) return;
      const idx = this.order[cursor];
      const isPriority = cursor < this.priorityCount;
      cursor++;
      return this.load(idx)
        .catch(() => undefined)
        .then(() => {
          if (isPriority) {
            this.loadedPriority++;
            const p = this.loadedPriority / this.priorityCount;
            this.listeners.forEach((fn) => fn(p));
            if (this.loadedPriority === this.priorityCount) this.priorityDone();
          }
          return next();
        });
    };
    for (let k = 0; k < this.concurrency; k++) next();
  }

  private load(i: number) {
    return new Promise<void>((resolve, reject) => {
      const im = new Image();
      im.decoding = "async";
      im.src = this.url(i);
      const done = () => {
        this.images[i] = im;
        resolve();
      };
      im.onerror = reject;
      im.onload = () => (im.decode ? im.decode().then(done, done) : done());
    });
  }

  /** Closest loaded frame to i (searches outward). */
  nearest(i: number): HTMLImageElement | null {
    i = Math.round(i);
    for (let d = 0; d < FRAME_COUNT; d++) {
      const a = this.images[i - d];
      if (a) return a;
      const b = this.images[i + d];
      if (b) return b;
    }
    return null;
  }
}
