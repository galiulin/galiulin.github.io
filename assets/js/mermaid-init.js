// assets/js/mermaid-init.js
// Initialises mermaid and renders all <pre class="mermaid"> blocks.
// Re-runs on InstantClick page change.
// Expects mermaid.min.js to be loaded beforehand as globalThis.mermaid.

(function () {
  const isDark = () =>
    document.documentElement.dataset.theme === "dark" ||
    document.body.classList.contains("dark");

  let initialised = false;

  async function init() {
    if (typeof globalThis.mermaid === "undefined") return;
    const blocks = document.querySelectorAll(
      "pre.mermaid:not([data-processed])"
    );
    if (blocks.length === 0) return;

    if (!initialised) {
      globalThis.mermaid.initialize({
        startOnLoad: false,
        theme: isDark() ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: "inherit",
      });
      initialised = true;
    }

    for (const block of blocks) {
      try {
        const id = "mermaid-" + Math.random().toString(36).slice(2, 9);
        const { svg } = await globalThis.mermaid.render(id, block.textContent);
        block.outerHTML = svg;
      } catch (e) {
        console.error("Mermaid render error:", e);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Re-run after InstantClick swaps the page body.
  document.addEventListener("instantclick:newpage", init);
})();