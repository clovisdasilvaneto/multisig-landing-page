export const padlock = (open = false, cls = "") => `
<svg class="${cls}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="${open ? "M7 11V8a5 5 0 0 1 9.6-2" : "M7 11V8a5 5 0 0 1 10 0v3"}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <rect x="4" y="11" width="16" height="11" rx="3" fill="currentColor"/>
  <circle cx="9.5" cy="16.5" r="1.3" fill="var(--bg, #050807)"/><circle cx="14.5" cy="16.5" r="1.3" fill="var(--bg, #050807)"/>
</svg>`;
