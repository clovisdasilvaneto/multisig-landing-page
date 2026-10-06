/** Tiny shared store between the scroll stage and the HUD. */
type State = { frame: number; progress: number };
const state: State = { frame: 0, progress: 0 };
const subs = new Set<(s: State) => void>();

export const store = {
  get: () => state,
  set(p: Partial<State>) {
    Object.assign(state, p);
    subs.forEach((fn) => fn(state));
  },
  sub(fn: (s: State) => void) {
    subs.add(fn);
    fn(state);
    return () => subs.delete(fn);
  },
};
