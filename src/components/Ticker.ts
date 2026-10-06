const ITEMS = [
  "No single point of failure",
  "Multi-sig by default",
  "Now guarding: treasuries that refuse to burn",
];

export function Ticker() {
  const run = [...ITEMS, ...ITEMS].map((t) => `<span class="ticker__dot">●</span><span>${t}</span>`).join("");
  return `
<div class="ticker" role="marquee" aria-label="${ITEMS.join(". ")}">
  <div class="ticker__track" aria-hidden="true">
    <div class="ticker__run">${run}</div><div class="ticker__run">${run}</div>
  </div>
</div>`;
}
