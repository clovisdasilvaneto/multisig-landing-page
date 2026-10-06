/**
 * Minimal char splitter. Wraps each word in a no-wrap span and each char in a
 * clip mask so chars can slide in from behind it. Keeps an aria-label with
 * the original text for screen readers.
 */
export function splitChars(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? "";
  el.setAttribute("aria-label", text.trim());
  el.textContent = "";
  const chars: HTMLElement[] = [];
  text.split(/(\s+)/).forEach((token) => {
    if (!token) return;
    if (/^\s+$/.test(token)) {
      el.append(document.createTextNode(" "));
      return;
    }
    const word = document.createElement("span");
    word.className = "split-word";
    word.setAttribute("aria-hidden", "true");
    for (const ch of token) {
      const mask = document.createElement("span");
      mask.className = "split-mask";
      const c = document.createElement("span");
      c.className = "split-char";
      c.textContent = ch;
      mask.append(c);
      word.append(mask);
      chars.push(c);
    }
    el.append(word);
  });
  return chars;
}

/** Splits text into word spans, preserving <mark> highlights as a flag. */
export function splitWords(el: HTMLElement): HTMLElement[] {
  const words: HTMLElement[] = [];
  const walk = (node: Node, hl: boolean, out: Node[]) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        (child.textContent ?? "").split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) return out.push(document.createTextNode(" "));
          const w = document.createElement("span");
          w.className = hl ? "word word--hl" : "word";
          w.textContent = t;
          words.push(w);
          out.push(w);
        });
      } else if (child instanceof HTMLElement) {
        walk(child, hl || child.tagName === "MARK", out);
      }
    });
  };
  const out: Node[] = [];
  walk(el, false, out);
  el.replaceChildren(...out);
  return words;
}
