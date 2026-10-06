# LOCKSTEP — scroll-scrubbed mascot site

Single-page marketing site where a 6 s mascot render is scrubbed by scroll on a
`<canvas>`, in the spirit of Oddball's studio site. Vite + vanilla TypeScript,
GSAP/ScrollTrigger, Lenis. No framework runtime.

## Quick start

```bash
npm install
npm run frames      # only needed if you change the video (needs ffmpeg with libwebp)
npm run dev         # http://localhost:5173
npm run build       # → dist/
npm run build:single  # → dist-single/lockstep.html, one self-contained file (preview/sharing)
```

The zip ships with the WebP frame sets. `npm run frames` regenerates everything,
including the JPG fallbacks used by browsers without WebP.

## Change the brand

Everything brand- and choreography-related lives in `src/config.ts`:

| Key | What it does |
| --- | --- |
| `BRAND`, `TAGLINE` | Wordmark, nav, receipt, footer, page copy |
| `CHAPTERS` | Frame ranges: hero 0–35, attack 36–95, multisig 96–144 |
| `FIRE` | Frames where the accent tweens green → orange → green, and the HUD threat curve |
| `SIGNER_FRAMES` | Frames where signers 1/2/3 light up (HUD + network panel) |
| `MASCOT_TRACK` | Mascot x-position per frame, keeps him in shot on narrow crops |
| `STAGE_VH` | Pin length of the scrubbed stage (desktop 300vh, mobile 220vh) |

Also update `<title>` / meta description in `index.html`. Contact submissions are
simulated until you set `ENDPOINT` in `src/components/ContactForm.ts` (receives
JSON `{ name, email, what }`).

## Assets

`scripts/extract-frames.sh` produces:

- `public/frames/desktop/f_0001…0145.{webp,jpg}` at 1920w (lanczos + light unsharp)
- `public/frames/mobile/f_0001…0145.{webp,jpg}` at 960w
- `public/stills/*.{webp,jpg}`: 3:4 portrait crops around the mascot for cards,
  protocol and contact; `key_18/70/132` wide frames for reduced motion

To swap the video, drop it in `assets/`, run `npm run frames`, update
`FRAME_COUNT` if it changed, and retune `CHAPTERS`, `FIRE`, `SIGNER_FRAMES` and
`MASCOT_TRACK` against the new footage. The still list (name:frame:mascotX) is at
the top of the script.

## How it works

- **ScrollCanvas** — one GSAP timeline where 1 unit = 1 frame, pinned with
  `scrub: true`. The timeline writes `{frame, vx, accent}`; a `gsap.ticker`
  callback draws only when the frame or size changes. Drawing is "cover" fit,
  panned so the mascot sits at `vx` across the viewport (centred in the hero,
  pushed right when text enters on desktop). Backing store is capped near source
  resolution.
- **Frame loading** (`lib/frames.ts`) — first/last frame, then strides of 16, 8, 4
  (37 frames) gate the loader; strides 2 and 1 fill in behind. Draws use the
  nearest loaded frame, so scrubbing works before everything arrives.
- **Accent** — `lib/accent.ts` interpolates `--accent` / `--accent-rgb` on `:root`;
  every neon element reads those vars.
- **Hud** subscribes to a tiny store (`lib/state.ts`); block number follows
  `scrollY`. It hides once the story ends.
- **Chapters** (`Hero`, `Manifesto`, `MultisigNetwork`) each add their own tweens
  to the master timeline at frame positions.
- **Protocol** — separate pin; progress → step 1–4. Diagram elements are classed
  `.from-N` and draw in with `stroke-dashoffset` via CSS when the SVG gets `sN`.
- Nav anchors pointing inside a pin are resolved by `registerAnchor()` in
  `lib/smooth.ts`.

## Responsive and accessibility

- Mobile (≤767px or coarse pointer ≤1023px): 960w frames, a 4:5 video window at the
  top that follows the mascot, copy beneath, shorter pins, swipeable card row.
- `prefers-reduced-motion`: no Lenis, no pins or scrub; the three chapters become
  static sections with key frames and fades; grain/marquee stop.
- Cards are keyboard-operable (Enter/Space flips), tabs are real buttons, the
  signature pad is optional (typed name is used), HUD meter exposes `aria-valuenow`.
- Custom padlock cursor and magnetic buttons only on fine pointers.

## Performance notes

- Desktop WebP set ≈ 18 MB, mobile ≈ 8 MB, streamed after a ~37-frame priority
  pass. If Lighthouse flags total byte weight, drop desktop to 1600w or quality 60
  in the script; the source is 832px so the visual loss is small.
- No layout reads in the scroll path; canvas draws are skipped when nothing
  changed.

## Structure

```
src/
  config.ts            brand + choreography
  main.ts              mounts components, boot sequence
  components/          Nav Loader Cursor Hero ScrollCanvas Hud Manifesto
                       MultisigNetwork Ticker ArsenalCards Protocol
                       ContactForm ScoreboardFooter
  lib/                 env, frames, smooth, split, accent, reveals, state, icons
  styles/main.css      tokens, components, responsive, reduced motion
scripts/
  extract-frames.sh    ffmpeg extraction
  inline-frames.mjs    single-file preview builder
```
