import "@fontsource/big-shoulders-display/latin-800";
import "@fontsource/big-shoulders-display/latin-900";
import "@fontsource/jetbrains-mono/latin-400";
import "@fontsource/jetbrains-mono/latin-700";
import "./styles/main.css";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArsenalCards, initArsenal } from "./components/ArsenalCards";
import { ContactForm, initContact } from "./components/ContactForm";
import { initCursor } from "./components/Cursor";
import { initHero, playHeroIntro } from "./components/Hero";
import { Hud, initHud } from "./components/Hud";
import { initLoader, Loader } from "./components/Loader";
import { Nav } from "./components/Nav";
import { initProtocol, Protocol } from "./components/Protocol";
import { initFooter, ScoreboardFooter } from "./components/ScoreboardFooter";
import { initScrollCanvas, ScrollCanvas } from "./components/ScrollCanvas";
import { Ticker } from "./components/Ticker";
import { env } from "./lib/env";
import { FrameStore } from "./lib/frames";
import { initReveals } from "./lib/reveals";
import { bindAnchors, initSmoothScroll, startScroll, stopScroll } from "./lib/smooth";

const html = document.documentElement;
html.classList.toggle("rm", env.reducedMotion);
html.classList.toggle("is-mobile", env.mobile);
history.scrollRestoration = "manual";
window.scrollTo(0, 0);

document.getElementById("app")!.innerHTML = `
  ${Loader()}
  ${Nav()}
  ${Hud()}
  <main id="top">
    ${ScrollCanvas()}
    ${Ticker()}
    ${ArsenalCards()}
    ${Protocol()}
    ${ContactForm()}
  </main>
  ${ScoreboardFooter()}
`;

const frames = new FrameStore(env.mobile ? 4 : 6);
const loader = initLoader();
let loaded = 0;
frames.onProgress((p) => loader.set(p, ++loaded));

initSmoothScroll();
stopScroll();
bindAnchors();
initHero();
initScrollCanvas(frames);
initHud();
initArsenal();
initProtocol();
initContact();
initFooter();
initReveals();
initCursor();

if (env.reducedMotion) {
  // key frames only: no need to wait for the sequence
  frames.ready.then(() => undefined);
  loader.set(1, 0);
  loader.hide().then(() => playHeroIntro(true));
} else {
  frames.start();
  Promise.all([frames.ready, document.fonts?.ready]).then(async () => {
    ScrollTrigger.refresh();
    await loader.hide();
    startScroll();
    playHeroIntro(false);
  });
}
