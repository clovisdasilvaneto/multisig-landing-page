import { BRAND, NAV } from "../config";
import { padlock } from "../lib/icons";

export function Nav() {
  return `
<header class="nav" role="banner">
  <a class="nav__brand" href="#top" aria-label="${BRAND}, back to top" data-cursor>
    <span class="nav__mark">${padlock()}</span>
    <span class="nav__name">${BRAND}</span>
  </a>
  <nav class="nav__links" aria-label="Sections">
    ${NAV.map((l) => `<a href="${l.href}" data-cursor><span class="mono-n">${l.n}</span> ${l.label}</a>`).join("")}
  </nav>
  <a class="btn btn--solid nav__cta" href="#contact" data-magnetic data-cursor>Secure now</a>
</header>`;
}
